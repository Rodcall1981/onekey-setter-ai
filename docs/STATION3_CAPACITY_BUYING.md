# Station 3: Buying Capacity (Capacidad de Compra)

## Overview

Station 3 has been redesigned to replace the traffic light semáforo (Verde/Amarillo/Rojo) with an **empathetic buying capacity calculation** that shows clients what they can actually afford.

Instead of risk categorization, clients see:
- **Maximum loan amount** they can service
- **Affordable property value** in UF and CLP
- **Estimated monthly dividend** they would pay
- **Loan term** based on their age

## Schema Changes

### discovery_responses Table
- ✅ **p1_age** (integer, required) - Age of the client, determines loan term

### profile_semaforo Table
**Replaced columns:**
- ❌ `traffic_light` (not used anymore)
- ❌ `semaforo_rationale` (replaced with capacity data)
- ❌ `estimated_dividend_uf` (replaced)
- ❌ `dividend_to_income_percent` (replaced)

**New columns:**
- ✅ `loan_term_years` (integer) - Term based on age
- ✅ `max_loan_amount_clp` (numeric) - Maximum loan in CLP
- ✅ `affordable_property_uf` (numeric) - Max property in UF
- ✅ `estimated_dividend_clp` (numeric) - Monthly dividend in CLP

### business_config Table
New constants added (already in DB):
- `ANNUAL_RATE_PERCENT` = 4.0 (annual mortgage rate)
- `INCOME_TO_DIVIDEND_RATIO` = 25 (% of income for debt service)
- `LOAN_TO_VALUE_PERCENT` = 80 (LTV ratio)
- `UF_VALUE_CLP` = 40,771 (updated UF value)

## Formula Implementation

### 1. Maximum Monthly Dividend
```
dividendo_máximo = renta_mensual × (INCOME_TO_DIVIDEND_RATIO / 100)
```

### 2. Loan Term by Age
```
if age ≤ 45 → 30 years
if 46 ≤ age ≤ 50 → 25 years
if 51 ≤ age ≤ 55 → 20 years
if 56 ≤ age ≤ 60 → 15 years
if 61 ≤ age ≤ 65 → 10 years
if age ≥ 66 → "Caso a caso" (requires manual evaluation)
```

### 3. Present Value Annuity Formula
```
PV = PMT × [1 - (1+i)^-n] / i

Where:
- PMT = maximum monthly dividend
- i = monthly interest rate = ANNUAL_RATE_PERCENT / 100 / 12
- n = term in months = loan_term_years × 12
```

### 4. Property Value
```
propiedad_valor = max_loan / (LOAN_TO_VALUE_PERCENT / 100)
propiedad_uf = propiedad_valor / UF_VALUE_CLP
```

## Test Case Verification

**Input:** Age 40, Income $2,225,719 CLP

**Output:**
- Maximum Monthly Dividend: $556,430
- Loan Term: 30 years
- Maximum Loan: $116,550,466 CLP
- Property Value: $145,688,082 CLP
- **Affordable Property: UF 3,573** ✅

This matches the expected range of ~UF 3,500.

## UI Changes in Station 3

### Profile Section (unchanged)
- Auto-detection: INVERSIONISTA_EXPERTO → INVERSIONISTA → PRIMERA_INVERSION → VIVIENDA_PROPIA
- Manual override for ambiguous cases (TOP 2 profiles)
- Profile confirmation button

### Capacity Section (NEW)
Shows empathetic message to client:
```
"Con tu renta y condiciones financieras:
• Crédito máximo: ~$[max_loan] (UF [x])
• Propiedad alcanzable: ~UF [affordable_uf]
• Dividendo estimado: ~$[dividend]/mes a [term] años"
```

For age 66+, shows:
```
"Requiere evaluación caso a caso por edad y plazo.
Conversemos con el equipo de crédito."
```

**Note visible to executive (gray, smaller):**
```
"Estimado conservador calculado a tasa 4% anual
(mercado real ~3,9%). No es una oferta de crédito.
Confirmar con banco."
```

## Events

- ✅ `station_started` (Station 3)
- ✅ `station_completed` (Station 3)
- ✅ `profile_corrected` (if advisor changes profile from auto-detected)
- ❌ ~~`semaforo_corrected`~~ (no longer applicable)

## Reunion Mode Support

- **1_reunion**: Station 3 → Station 4 flow
- **2_reuniones**: Station 3 → Reunión 2 scheduling (future)

## Testing

### Backend Endpoints
- ✅ `POST /api/sessions` - Create session
- ✅ `POST /api/discovery` - Save discovery (now includes p1_age)
- ✅ `GET /api/discovery/:sessionId` - Fetch discovery for capacity calc
- ✅ `GET /api/business-config` - Get constants
- ✅ `POST /api/profile-semaforo` - Save capacity data
- ✅ `POST /api/events` - Register events

### Test Case (Verified ✅)
```bash
curl -X POST http://localhost:3001/api/sessions \
  -H "Content-Type: application/json" \
  -d '{"setter_id":"test","client_name":"Test","reunion_mode":"1_reunion"}'

# Then save discovery with p1_age=40, p2_monthly_income_clp=2225719
# Expected capacity: UF 3,573 ✅
```

## Rollout Notes

1. ✅ Added `p1_age` to P1 question with age input (required)
2. ✅ Discovery validation now requires p1_age
3. ✅ Implemented `calculateBuyingCapacity()` function with annuity formula
4. ✅ Updated Station 3 UI to show capacity instead of semáforo
5. ✅ Updated save function to store capacity data
6. ✅ Removed semáforo dropdown controls and confirmatio
n
7. ✅ Formula tested against case: Age 40, Income 2.225.719 → UF 3,573 ✅

## Next Steps

- Browser testing (Stations 1 → 2 → 3 flow)
- Verify p1_age field renders correctly in UI
- Test all age brackets (≤45, 46-50, 51-55, 56-60, 61-65, 66+)
- Confirm capacity messages display correctly
- Test Station 3 → Station 4 (or Reunión 2) flow
- Ready for Station 4 implementation
