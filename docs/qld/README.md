# Queensland Planning Data Research

This directory contains research and documentation specific to ingesting Queensland planning and zoning data into Propure.

## Context

Queensland uses a **decentralized planning system** where zoning is managed by individual local government areas (councils). This contrasts with NSW's centralized Standard Instrument LEP approach.

## Key Challenges

1. **Council-Specific Zoning**: Each of the 77 QLD councils has its own planning scheme with unique zone codes
2. **No Statewide WFS**: Unlike NSW/VIC, there's no single WFS endpoint for planning zones
3. **Land Use ≠ Zoning**: State provides ALUMC land use data, not detailed planning zoning
4. **Varying Access Methods**: Some councils offer WFS/WMS, others only interactive maps, many require direct contact

## Research Focus

- Major council planning schemes (Brisbane, Gold Coast, Sunshine Coast, Logan, etc.)
- Data access methods and formats per council
- Zone code standardization approaches
- Technical implementation patterns
- Cost and licensing considerations

## Documentation

- `qld-approach-research.md` - Comprehensive research on QLD planning data acquisition strategy
- `council-data-matrix.md` - (Planned) Matrix of data access methods by council
- `zone-code-mapping.md` - (Planned) Zone code translation tables

## Related Documents

- `/docs/PLANNING-DATA-STRATEGY.md` - Overall planning data strategy
- `/docs/land-use-zones-research.md` - NSW and QLD datasource comparison
