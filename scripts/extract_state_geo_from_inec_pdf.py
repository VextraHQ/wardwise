#!/usr/bin/env python3
"""
Extract a single state's ward + polling-unit records from an INEC polling-unit PDF.

Requires:
  python3 -m pip install pypdf

Example:
  python3 scripts/extract_state_geo_from_inec_pdf.py \
    --state-code AD \
    --state-name Adamawa \
    --pdf /path/to/02.pdf \
    --out prisma/data/adamawa-wards-pus.json
"""

from __future__ import annotations

import argparse
import json
import re
from collections import OrderedDict
from pathlib import Path
from typing import Dict, List

from pypdf import PdfReader


HEADER_PATTERN = re.compile(r"^\s*S/N\s+STATE\s+LGA\s+WARD\s+PU NAME\s+CODE\s*$")
FOOTER_PATTERN = re.compile(r"^\s*\d+\s+of\s+\d+\s*$")
FULL_CODE_PATTERN = re.compile(r"^\d{2}-\d{2}-\d{2}-\d{3}$")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("--state-code", required=True, help="State code, e.g. AD")
    parser.add_argument(
        "--state-name",
        required=True,
        help="State name exactly as it appears in the PDF state column, e.g. Adamawa",
    )
    parser.add_argument("--pdf", required=True, help="Path to the INEC PDF")
    parser.add_argument("--out", required=True, help="Output JSON path")
    return parser.parse_args()


def iter_state_records(pdf_path: Path, state_name: str):
    reader = PdfReader(str(pdf_path))
    target_state = state_name.upper()

    for page_no, page in enumerate(reader.pages, start=1):
        text = page.extract_text(extraction_mode="layout") or ""

        for raw_line in text.splitlines():
            line = raw_line.strip()

            if not line:
                continue
            if HEADER_PATTERN.match(line) or FOOTER_PATTERN.match(line):
                continue

            parts = re.split(r"\s{2,}", line)
            if not parts:
                continue

            serial = None
            lga_idx = None

            if len(parts) >= 6 and parts[0].isdigit() and parts[1] == target_state:
                serial = parts[0]
                lga_idx = 2
            elif len(parts) >= 5:
                match = re.match(rf"^(\d+)\s+{re.escape(target_state)}$", parts[0])
                if match:
                    serial = match.group(1)
                    lga_idx = 1

            if serial is None or lga_idx is None or len(parts) - lga_idx < 4:
                continue

            lga_name = parts[lga_idx]
            ward_name = parts[lga_idx + 1]
            full_code = parts[-1]
            polling_unit_name = " ".join(parts[lga_idx + 2 : -1]).strip()

            if not FULL_CODE_PATTERN.match(full_code):
                continue

            yield {
                "serial": int(serial),
                "lgaName": lga_name,
                "wardName": ward_name,
                "pollingUnitName": polling_unit_name,
                "fullCode": full_code,
                "wardSourceCode": "-".join(full_code.split("-")[:3]),
                "lgaSourceCode": "-".join(full_code.split("-")[:2]),
                "pollingUnitCode": full_code.split("-")[-1],
                "page": page_no,
            }


def build_dataset(records: List[dict], state_code: str, state_name: str, pdf_path: Path):
    lga_map: "OrderedDict[str, dict]" = OrderedDict()

    for record in records:
        lga = lga_map.setdefault(
            record["lgaName"],
            {
                "name": record["lgaName"],
                "sourceCode": record["lgaSourceCode"],
                "_wardMap": OrderedDict(),
            },
        )

        ward = lga["_wardMap"].setdefault(
            record["wardSourceCode"],
            {
                "name": record["wardName"],
                "sourceCode": record["wardSourceCode"],
                "pollingUnits": [],
            },
        )

        ward["pollingUnits"].append(
            {
                "code": record["pollingUnitCode"],
                "fullCode": record["fullCode"],
                "name": record["pollingUnitName"],
            }
        )

    lgas = []
    ward_total = 0
    pu_total = 0

    for lga in lga_map.values():
        wards = list(lga.pop("_wardMap").values())
        lga["wards"] = wards
        lgas.append(lga)
        ward_total += len(wards)
        pu_total += sum(len(ward["pollingUnits"]) for ward in wards)

    return {
        "stateCode": state_code.upper(),
        "stateName": state_name,
        "source": {
            "pdfFile": pdf_path.name,
            "pollingUnitCodeMode": "last-segment",
            "fullCodePattern": "SS-LL-WW-PPP",
        },
        "summary": {
            "lgas": len(lgas),
            "wards": ward_total,
            "pollingUnits": pu_total,
        },
        "lgas": lgas,
    }


def main():
    args = parse_args()
    pdf_path = Path(args.pdf).expanduser().resolve()
    out_path = Path(args.out).expanduser().resolve()

    records = list(iter_state_records(pdf_path, args.state_name))

    if not records:
        raise SystemExit(
            f"No records found for state '{args.state_name}' in {pdf_path}"
        )

    serials = [record["serial"] for record in records]
    expected = list(range(serials[0], serials[-1] + 1))
    missing = sorted(set(expected) - set(serials))

    if missing:
        raise SystemExit(
            f"Missing serial rows detected while parsing: {missing[:10]}"
        )

    dataset = build_dataset(records, args.state_code, args.state_name, pdf_path)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(json.dumps(dataset, indent=2, ensure_ascii=True) + "\n")

    print(
        json.dumps(
            {
                "stateCode": dataset["stateCode"],
                "stateName": dataset["stateName"],
                "lgas": dataset["summary"]["lgas"],
                "wards": dataset["summary"]["wards"],
                "pollingUnits": dataset["summary"]["pollingUnits"],
                "output": str(out_path),
            },
            indent=2,
        )
    )


if __name__ == "__main__":
    main()
