# XTCEForge Pro (v1.0.0)

## CCSDS 660.0-B-2 & OMG XTCE 1.2 XML Telemetric & Command Exchange Database Studio

XTCEForge Pro is a commercial-grade, zero-dependency space telemetry decommutation and telecommand engineering database studio implementing the international standards **CCSDS 660.0-B-2 (Blue Book)** and **OMG XTCE 1.2**.

It delivers high-fidelity bit-level telemetry packet decommutation, polynomial calibrator curve evaluation, multi-tier operational alarm limit monitoring, telecommand argument serialization, and normative compliance auditing for satellite databases across mission phases.

---

### Key Capabilities

- **Bit-Level Telemetry Decommutation**: High-performance extraction of arbitrary bit-length signed and unsigned integers, floats, and enumerations across non-byte-aligned packet buffers.  
- **Polynomial & Spline Calibration**: Evaluates arbitrary-order polynomial calibration curves (\$y \= c\_0 \+ c\_1 x \+ c\_2 x^2 \+ \\dots\$) converting raw ADC counts to calibrated engineering units (Volts, Amperes, °C).  
- **Multi-Tier Alarm Limits**: Real-time evaluation of telemetry observables against Warning-Low, Warning-High, Critical-Low, and Critical-High threshold bands.  
- **State Enumeration Resolution**: Maps binary telemetry status codes to human-readable spacecraft operational states (e.g. BOOT, STANDBY, NOMINAL, SAFE\_HOLD).  
- **Telecommand Argument Serialization**: Packages command opcodes and structured argument parameters into binary command frames with byte alignment and parity.  
- **10-Point Normative Auditor**: Automated verification covering SpaceSystem namespace conformance, header completeness, bit bounds, polynomial validity, alarm monotonicity, and XML syntax.  
- **Zero-Dependency Architecture**: Standalone pure JavaScript web console and pure Python 3 CLI tool with 100% standard library compliance.

---

### Project Structure

xtce-forge-pro/

├── source-code/

│   ├── index.html                   \# Mission Control Web Console & Decommutator

│   ├── xtce-engine.js               \# Core Decommutation, Calibration & XML Engine

│   ├── xtce-auditor.js              \# 10-Point CCSDS/OMG Normative Compliance Auditor

│   ├── xtce\_cli.py                  \# Python 3 Command-Line Database & Packet Tool

│   ├── xtce-cli.py                  \# CLI Executable Alias

│   └── test\_runner.py               \# Automated Unit Test Suite (10/10 PASS)

├── build/

│   └── xtce-forge-pro-v1.0.0.zip     \# Complete Production Release Package

├── documentation/

│   ├── CCSDS\_XTCE\_SPECIFICATION.md  \# Protocol Engineering Guide

│   └── XTCE\_DATABASE\_COMPLIANCE\_MATRIX.md \# 10-Point Compliance Checklist

├── screenshots/

│   ├── architecture-diagram.svg     \# End-to-End System Architecture

│   └── xtce-studio-preview.svg      \# Mission Console UI & Decommutator Preview

├── README.md                        \# Product Overview & Developer Guide

└── PROGRESS\_REPORT.md               \# Product Factory Cycle Execution Report

---

### Automated Test Suite Execution

python3 source-code/test\_runner.py \-v

Output:

test\_01\_xtce\_xml\_generation (\_\_main\_\_.TestXTCEForgePro) ... ok

test\_02\_bit\_reader\_unaligned (\_\_main\_\_.TestXTCEForgePro) ... ok

test\_03\_signed\_integer\_sign\_extension (\_\_main\_\_.TestXTCEForgePro) ... ok

test\_04\_polynomial\_calibration (\_\_main\_\_.TestXTCEForgePro) ... ok

test\_05\_enumeration\_mapping (\_\_main\_\_.TestXTCEForgePro) ... ok

test\_06\_alarm\_limit\_evaluation (\_\_main\_\_.TestXTCEForgePro) ... ok

test\_07\_full\_packet\_decommutation (\_\_main\_\_.TestXTCEForgePro) ... ok

test\_08\_telecommand\_encoding (\_\_main\_\_.TestXTCEForgePro) ... ok

test\_09\_normative\_auditor\_pass (\_\_main\_\_.TestXTCEForgePro) ... ok

test\_10\_normative\_auditor\_reject\_broken\_alarms (\_\_main\_\_.TestXTCEForgePro) ... ok

Ran 10 tests in 0.004s

OK

---

### Licensing & Standards Compliance

- Standard: Consultative Committee for Space Data Systems (CCSDS) 660.0-B-2 & Object Management Group (OMG) XTCE 1.2.  
- Architecture: Zero-dependency ECMAScript 2022 & Python 3.8+.  
- Commercial License: Dual MIT / Commercial Aerospace Site License (\$2,800/yr).