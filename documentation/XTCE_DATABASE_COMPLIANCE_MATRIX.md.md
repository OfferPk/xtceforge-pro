# XTCE Satellite Database 10-Point Normative Compliance Matrix

| Rule ID | Check Item | Normative Reference | Verification Method | Pass Criteria |
| :---- | :---- | :---- | :---- | :---- |
| **XTCE-001** | SpaceSystem Root & Namespace | CCSDS 660.0-B-2 §3.2 / OMG XTCE 1.2 §4.2 | Tag & Namespace Parse | Root `<SpaceSystem>` with valid OMG XTCE namespace |
| **XTCE-002** | Header Block Completeness | CCSDS 660.0-B-2 §3.3 / OMG XTCE 1.2 §4.3 | Attribute Verification | Mandatory `date`, `version`, and `author` present |
| **XTCE-003** | Parameter & Type Reference Integrity | CCSDS 660.0-B-2 §4.2 / OMG XTCE 1.2 §5.2 | Graph Reference Check | Every `<Parameter>` references a declared `<ParameterType>` |
| **XTCE-004** | Bit-Length & Integer Encoding Bounds | OMG XTCE 1.2 §5.3.2 | Range Validation | \$1 \\le \\text{sizeInBits} \\le 64\$ and valid encoding (`twosComplement` / `unsigned`) |
| **XTCE-005** | Polynomial Calibrator Coeffs Validity | CCSDS 660.0-B-2 §4.4 / OMG XTCE 1.2 §5.4.1 | Mathematical Check | Exponents non-negative and coefficients real numbers |
| **XTCE-006** | Enumeration Values & Labels Uniqueness | OMG XTCE 1.2 §5.3.4 | Set Uniqueness Check | Distinct numeric values and unique state labels |
| **XTCE-007** | Alarm Limit Ordering Consistency | Mission Operations Standard | Monotonic Bounds Check | \$\\text{CriticalLow} \< \\text{WarningLow} \< \\text{WarningHigh} \< \\text{CriticalHigh}\$ |
| **XTCE-008** | SequenceContainer & EntryList Integrity | CCSDS 660.0-B-2 §4.5 / OMG XTCE 1.2 §5.5 | Container Hierarchy Check | SequenceContainer has valid `name` and non-empty `<EntryList>` |
| **XTCE-009** | MetaCommand & ArgumentList Conformance | CCSDS 660.0-B-2 §5.2 / OMG XTCE 1.2 §6.2 | Command Structure Check | MetaCommands define valid names and non-empty argument sets |
| **XTCE-010** | Strict XML Syntax & Well-Formedness | W3C XML 1.0 Specification | XML Well-Formedness | Well-formed XML tree with matched opening and closing tags |

