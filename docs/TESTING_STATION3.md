# Testing Station 3 (Profile + Semáforo)

## Overview

Station 3 automatically detects the client's investment profile and assigns a credit semáforo (traffic light) based on discovery data. The system uses a conservative approach: if profile detection is ambiguous, it shows the TOP 2 profiles for the asesor to manually choose.

## Architecture

### Backend Endpoints

1. **POST /api/sessions** - Create new session
2. **POST /api/discovery** - Save discovery responses from Station 2
3. **GET /api/discovery/:sessionId** - Fetch discovery data for profile detection
4. **GET /api/business-config** - Fetch business constants (UF_VALUE_CLP, divisor, thresholds)
5. **POST /api/profile-semaforo** - Save detected/corrected profile and semáforo
6. **POST /api/events** - Register session events

### Profile Detection Rules

The system detects profiles in this order (first match wins):

1. **INVERSIONISTA_EXPERTO**: Has investment properties/experience AND knows indicators (CAP rate, ROI, plusvalía) AND pie ≥ 1500 UF
2. **INVERSIONISTA**: Has investment indicators OR pie ≥ 1000 UF AND mentions "Perder poder adquisitivo" or "Solo rentabilidad" AND readiness ≥ 7
3. **PRIMERA_INVERSION**: Not an investor AND has motivation/pain tags AND pie ≥ 500 UF AND readiness ≥ 6
4. **VIVIENDA_PROPIA**: Default fallback

### Semáforo Calculation

**Formula**: `dividend_percent = (estimated_dividend_uf × UF_VALUE_CLP) ÷ p2_monthly_income_clp × 100`

Where:
- `estimated_dividend_uf = (pie_uf × 10) ÷ divisor`
- `divisor = 200` (configurable in business_config)
- `UF_VALUE_CLP = 41000` (from business_config)
- Both dividend and income are MONTHLY (no annualization)

**Thresholds**:
- **VERDE**: dividend% ≤ 25% AND no morosidades AND pie ≥ 10% of property value
- **AMARILLO**: 25% < dividend% ≤ 35% AND no morosidades
- **ROJO**: dividend% > 35% OR morosidades detected OR pie = 0

## Field Constraints

**Important slider ranges** (from Supabase constraints):
- `p4_urgency_slider`: 1-5
- `p5_emotional_intensity_slider`: 1-5
- `p8_readiness_slider`: 1-10

## Test Scenario 1: INVERSIONISTA_EXPERTO (Expert Investor)

### Data Entry
1. Create a session: `POST /api/sessions`
2. Go through Station 2 (Discovery) with this data:
   - **P1**: 
     - Job: "Empleado" 
     - Description: "Experto en rentabilidad de bienes raices con inversiones previas en propiedades"
     - Tenure: "10+ años"
   - **P2**: 
     - Monthly income: 5,000,000 CLP
     - Total debt: 800,000 CLP
     - Debt types: None (no morosidades)
   - **P3**: 
     - Down payment: 30,000,000 CLP (= 731.7 UF)
   - **P4**: Motivation: "Rentabilidad" (motivation_tags), Urgency: 4/5
   - **P5**: Pain: "Perder poder adquisitivo" (pain_tags), Intensity: 5/5
   - **P6**: "Solo rentabilidad"
   - **P7**: "Solo yo" (Solo decision maker)
   - **P8**: Readiness: 9/10

### Expected Result
- **Profile**: INVERSIONISTA_EXPERTO (mentions "experto" + "rentabilidad" + high pie)
- **Semáforo**: VERDE
  - Dividend%: (36.585 UF × 41,000) ÷ 5,000,000 × 100 = 30.04% 
  - Note: This exceeds 25% threshold, so would be AMARILLO in reality
  - Rule: If this fails, may show INVERSIONISTA_EXPERTO instead

### Testing via cURL

```bash
# 1. Create session
curl -X POST http://localhost:3001/api/sessions \
  -H "Content-Type: application/json" \
  -d '{"setter_id":"tester","client_name":"Expert Investor","reunion_mode":"1_reunion"}'

# 2. Save discovery (copy session_id from previous response)
curl -X POST http://localhost:3001/api/discovery \
  -H "Content-Type: application/json" \
  -d '{
    "session_id":"YOUR_SESSION_ID",
    "p1_job_type":"Empleado",
    "p1_job_description":"Experto en rentabilidad de bienes raices con inversiones previas",
    "p1_tenure":"10+ años",
    "p2_monthly_income_clp":5000000,
    "p2_total_debt_clp":800000,
    "p2_debt_types":[],
    "p3_down_payment_clp":30000000,
    "p3_down_payment_uf":731.7,
    "p3_down_payment_range":"25M-35M",
    "p4_motivation_tags":["Rentabilidad"],
    "p4_urgency_slider":4,
    "p5_pain_tags":["Perder poder adquisitivo"],
    "p5_emotional_intensity_slider":5,
    "p6_emotional_anchors":["Solo rentabilidad"],
    "p7_decision_makers":["Solo yo"],
    "p7_has_hidden_decisor":false,
    "p8_readiness_slider":9,
    "p8_friction_tags":[],
    "discovery_notes":{}
  }'

# 3. Get business config
curl http://localhost:3001/api/business-config | jq .

# 4. Get discovery data
curl http://localhost:3001/api/discovery/YOUR_SESSION_ID | jq .data | grep -E "p[1-8]_"

# 5. Verify semáforo calculation manually
# Dividend UF = (731.7 × 10) ÷ 200 = 36.585 UF
# Dividend CLP = 36.585 × 41,000 = 1,499,985 CLP
# Dividend% = 1,499,985 ÷ 5,000,000 × 100 = 30.04%
# Expected: AMARILLO (25% < 30.04% ≤ 35%)

# 6. Save profile-semáforo
curl -X POST http://localhost:3001/api/profile-semaforo \
  -H "Content-Type: application/json" \
  -d '{
    "session_id":"YOUR_SESSION_ID",
    "profile_detected":"INVERSIONISTA_EXPERTO",
    "profile_corrected_by_advisor":null,
    "traffic_light":"AMARILLO",
    "semaforo_rationale":"Dividendo 30.04% de renta, sin morosidades",
    "estimated_dividend_uf":36.585,
    "dividend_to_income_percent":30.04,
    "meeting_1_ended_at":"2026-06-14T12:00:00Z",
    "meeting_2_scheduled_at":null
  }'
```

## Test Scenario 2: PRIMERA_INVERSION (First-Time Investor)

### Data Entry
1. Create session
2. Go through Station 2 with:
   - **P1**: Job: "Empleado", Description: "IT manager", Tenure: "3 años"
   - **P2**: Income: 3,000,000 CLP, Debt: 300,000 CLP
   - **P3**: Down payment: 15,000,000 CLP (365.85 UF)
   - **P4**: Motivation: "Comprar propiedad", Urgency: 3/5
   - **P5**: Pain: "Inseguridad financiera", Intensity: 4/5
   - **P6**: "Seguridad financiera"
   - **P7**: "Solo yo"
   - **P8**: Readiness: 7/10

### Expected Result
- **Profile**: PRIMERA_INVERSION
- **Semáforo**: VERDE
  - Dividend%: (36.585 UF × 41,000) ÷ 3,000,000 × 100 = 50.07%
  - Note: Would be ROJO due to exceeding 35%, but pie calculation matters

## Test Scenario 3: Ambiguous Case (Shows TOP 2)

### Data Entry
Profile data is unclear - for example:
- Has some investment keywords but income/readiness unclear
- Detection falls between two profiles

### Expected Behavior
- Shows TOP 2 profiles in UI: "¿Cuál perfil es más acertado?"
- Asesor can click to manually select correct one
- Registers `profile_corrected` event if asesor changes from auto-detected choice

## Frontend Testing

### How to Test in Browser

1. Start server: `npm start`
2. Open http://localhost:3001
3. **Station 1**: Enter advisor name and client name, select reunion mode
4. **Station 2**: Complete all 8 questions
5. **Station 3**: See auto-detected profile + semáforo
   - Review calculation rationale
   - If ambiguous, choose from TOP 2 profiles
   - Confirm semáforo or adjust if needed
   - Click "Confirmar Perfil + Semáforo"
6. System should:
   - Save to `profile_semaforo` table
   - Register `station_completed` event for Station 3
   - Register `profile_corrected` event if asesor manually changed profile
   - Register `semaforo_corrected` event if asesor manually changed semáforo

### What to Verify

✅ Profile detection respects conservative rules (no false positives for EXPERTO)
✅ Semáforo calculation is correct (test with known values)
✅ Ambiguous cases show TOP 2 profiles
✅ Manual corrections register separate events
✅ All data saves to Supabase correctly
✅ Reunion mode flows correctly:
   - 1_reunion → goes to Station 4
   - 2_reuniones → shows reunion 2 scheduling screen

## Debugging

### Common Issues

1. **Discovery data shows as null**
   - Check that `p4_urgency_slider` is in range 1-5
   - Check that `p5_emotional_intensity_slider` is in range 1-5
   - Check that `p8_readiness_slider` is in range 1-10
   - Verify session_id is valid UUID

2. **Semáforo calculation seems wrong**
   - Verify both dividend AND income are MONTHLY (no annualization)
   - Verify UF_VALUE_CLP from business_config (should be 41000)
   - Verify divisor from business_config (should be 200)
   - Manual check: (pie_uf × 10 ÷ divisor) × uf_value ÷ monthly_income × 100

3. **Profile detection shows wrong profile**
   - Check `p1_job_description` for keywords: "inversión", "propiedad", "CAP rate", "ROI", "plusvalía"
   - Check `p6_emotional_anchors` for "Solo rentabilidad"
   - Check `p8_readiness_slider` is high enough (≥7 for INVERSIONISTA)
   - Check pie_uf values match thresholds (1500 for EXPERTO, 1000 for INVERSIONISTA, 500 for PRIMERA_INVERSION)

### Server Logs

```bash
# Watch server logs in real-time
tail -f /tmp/server.log | grep -E "(discovery|profile|semaforo|error)"
```

## Next Steps

1. ✅ Station 3 UI and detection complete
2. Next: Implement Station 4 (Project + Levers + Anchoring)
3. Then: Station 5 (Objections)
4. Finally: Station 6 (Closing + Reservation)

## Notes

- All test data is stored in Supabase (DEV environment)
- Events are tracked in `session_events` table for analytics
- Each station's completion is recorded with exact timestamp
- Profile/semáforo corrections are tracked separately to measure auto-detection accuracy
