# CCSDS 660.0-B-2 & OMG XTCE 1.2 XML Telemetric & Command Exchange Specification

## 1\. Executive Summary & Normative Scope

The Consultative Committee for Space Data Systems (CCSDS) 660.0-B-2 Blue Book and Object Management Group (OMG) XTCE 1.2 standard define an authoritative, vendor-independent XML schema for describing satellite telemetry and telecommand databases.

XTCE serves as the common denominator across all phases of the spacecraft lifecycle:

- Flight Software (FSW) parameter declarations and command tables.  
- Assembly, Integration, and Test (AIT / EGSE) benches.  
- Ground Segment Mission Operations Centers (MOC), such as NASA AMMOS/AIT, OpenMCT, Yamcs, ESA SCOS-2000, and COSMOS.  
- Tracking ground stations and flight dynamics facilities.

---

## 2\. SpaceSystem Information Hierarchy

### 2.1 Root Structure

A conforming XTCE document is rooted at the `<SpaceSystem>` element:

\<SpaceSystem xmlns="http\://www\.omg.org/spec/XTCE/20180204"

             name="CubeSat\_EPS\_Subsystem"

             shortDescription="CubeSat Electrical Power System Telemetry & Telecommand Database"\>

  \<Header date="2026-10-17T09:00:00.000Z" version="1.2" author="XTCEForge Pro Studio"/\>

  \<TelemetryMetaData\> ... \</TelemetryMetaData\>

  \<CommandMetaData\> ... \</CommandMetaData\>

\</SpaceSystem\>

### 2.2 Telemetry Metadata Structure

1. **ParameterTypeSet**: Defines reusable data types:  
   - `IntegerParameterType`: Declares bit length (`sizeInBits`), signedness (`signed="true/false"`), and bit encoding (`twosComplement` or `unsigned`).  
   - `EnumeratedParameterType`: Maps discrete integer telemetry values to operational state strings (`<EnumerationList>`).  
   - `FloatParameterType`: IEEE-754 single (32-bit) or double (64-bit) precision floating point numbers.  
2. **Calibrators**:  
   - `PolynomialCalibrator`: Converts raw digital integer counts into physical engineering values (e.g., Volts, Amperes, °C) via polynomial equations: \$\$y \= c\_0 \+ c\_1 x \+ c\_2 x^2 \+ \\dots\$\$  
3. **Alarm Limits**:  
   - Multi-tiered operational limit thresholds: `CriticalLow < WarningLow < WarningHigh < CriticalHigh`.  
4. **SequenceContainers**:  
   - Defines packet layout via an ordered `<EntryList>` of `<ParameterRefEntry>` elements, detailing exact packet bit layouts without gaps or overlap.

### 2.3 Command Metadata Structure

1. **MetaCommandSet**: Defines telecommands sent to the spacecraft.  
2. **ArgumentList**: Input arguments required for command execution.  
3. **CommandContainer**: Encapsulates binary packet serialization and opcode mapping.

---

## 3\. Normative XML Document Sample

\<?xml version="1.0" encoding="UTF-8"?\>

\<SpaceSystem xmlns="http\://www\.omg.org/spec/XTCE/20180204"

             xmlns:xsi="http\://www\.w3.org/2001/XMLSchema-instance"

             name="CubeSat\_EPS\_Subsystem"

             shortDescription="CubeSat Electrical Power System Telemetry \&amp; Telecommand Database"\>

  \<Header date="2026-10-17T09:00:00.000Z" version="1.2" author="XTCEForge Pro Studio"/\>

  \<TelemetryMetaData\>

    \<ParameterTypeSet\>

      \<IntegerParameterType name="BATT\_VOLTAGE\_Type" signed="false"\>

        \<UnitList\>\<Unit\>V\</Unit\>\</UnitList\>

        \<IntegerDataEncoding sizeInBits="16" encoding="unsigned"/\>

        \<DefaultCalibrator\>

          \<PolynomialCalibrator\>

            \<PolynomialCoefficient exponent="0" value="0.0"/\>

            \<PolynomialCoefficient exponent="1" value="0.001"/\>

          \</PolynomialCalibrator\>

        \</DefaultCalibrator\>

      \</IntegerParameterType\>

    \</ParameterTypeSet\>

    \<ParameterSet\>

      \<Parameter name="BATT\_VOLTAGE" parameterTypeRef="BATT\_VOLTAGE\_Type" shortDescription="Battery Bus Voltage"/\>

    \</ParameterSet\>

    \<ContainerSet\>

      \<SequenceContainer name="HK\_Telemetry\_Packet"\>

        \<EntryList\>

          \<ParameterRefEntry parameterRef="BATT\_VOLTAGE"/\>

        \</EntryList\>

      \</SequenceContainer\>

    \</ContainerSet\>

  \</TelemetryMetaData\>

\</SpaceSystem\>