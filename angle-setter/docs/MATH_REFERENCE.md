# UWGAS Mathematical Reference & Golden Master Test Tables

> **Universal Wet Grinder Angle Setter (UWGAS)**
> *Canonical geometric formulas, variable definitions, and verified test vectors based on Dutchman and Ton trigonometry.*

---

## 📐 Geometric Model

```
               [USB Bar (top)]
                    (•) Ds
                     |  \
                     |   \  CA
                     |    \
             y       |     \
         (vertical)  |      \
                     |       \
                     |   o    \
  [Axle] ------------+---------• (Axle Centre)
                     |
                     hc (datum offset)
                     |
               [Machine Base Datum]
```

---

## 🔢 Step-by-Step Dutchman Formulation (`computeTonHeights`)

Given inputs:
- Wheel diameter $D$ (mm), radius $R = D/2$
- Projection $A$ (mm)
- Target bevel angle $\beta$ (degrees per side)
- Optional MicroBump $\Delta\beta_{\text{mb}}$ and step offset $\Delta\beta_{\text{step}}$ (degrees)
- Jig collar diameter $D_j$ (mm)
- Universal Support Bar diameter $D_s$ (mm)
- Machine constants for selected base: $h_c$ (vertical offset) and $o$ (horizontal offset)

### 1. Apex-to-Jig Distance along Tangent ($jg$)
$$jg = A - \frac{D_s}{2}$$

### 2. Jig Center to USB Center ($CJ$)
$$CJ = \frac{D_j}{2} + \frac{D_s}{2}$$

### 3. Apex to USB Center ($CG$)
$$CG = \sqrt{jg^2 + CJ^2}$$

### 4. Jig Angle Offset ($\phi$)
$$\phi = \arctan\left(\frac{CJ}{jg}\right)$$

### 5. Effective Total Angle ($\beta_{\text{total}}$)
$$\beta_{\text{total}} = \beta + \Delta\beta_{\text{step}}$$
$$\beta_{\text{rad}} = \frac{\beta_{\text{total}} \cdot \pi}{180}$$

### 6. Wheel Center to USB Center ($CA$ - Law of Cosines)
$$CA = \sqrt{CG^2 + R^2 + 2 \cdot CG \cdot R \cdot \sin(\beta_{\text{rad}} - \phi)}$$

### 7. Wheel Surface Height ($h_r$)
$$h_r = (CA - R) + \frac{D_s}{2}$$

### 8. Machine Datum Base Height ($h_n$)
$$y = \sqrt{\max(CA^2 - o^2, 0)}$$
$$h_n = y - h_c + \frac{D_s}{2}$$

---

## 🧪 Golden Master Verification Test Vectors

These verified reference calculations can be used to validate the math engine during automated testing or manual sanity checks.

### Standard Test Setup (Tormek T-8 Default Geometry)
- **Machine Constants**: 
  - Rear Base: $h_c = 29.00\text{ mm}$, $o = 50.00\text{ mm}$
  - Front Base: $h_c = 51.30\text{ mm}$, $o = 131.70\text{ mm}$
- **Diameters**: $D_s = 12.00\text{ mm}$, $D_j = 12.00\text{ mm}$

### Reference Case 1: Standard Kitchen Knife 15° Bevel (Rear Base / Edge Leading)
- **Inputs**: $D = 250.00\text{ mm}$, $A = 139.00\text{ mm}$, $\beta = 15.00^\circ$, Base = Rear
- **Intermediate Values**:
  - $jg = 133.00\text{ mm}$
  - $CJ = 12.00\text{ mm}$
  - $CG = 133.540\text{ mm}$
  - $\phi = 0.08998\text{ rad} \approx 5.155^\circ$
  - $\beta - \phi = 9.845^\circ$
  - $CA = 227.142\text{ mm}$
- **Outputs**:
  - **$h_r = 108.14\text{ mm}$**
  - **$y = 221.570\text{ mm}$**
  - **$h_n = 198.57\text{ mm}$**

### Reference Case 2: Worn Wheel at 220mm (Rear Base / Edge Leading)
- **Inputs**: $D = 220.00\text{ mm}$, $A = 139.00\text{ mm}$, $\beta = 15.00^\circ$, Base = Rear
- **Outputs**:
  - **$h_r = 106.66\text{ mm}$**
  - **$CA = 210.662\text{ mm}$**
  - **$h_n = 181.65\text{ mm}$**

### Reference Case 3: Leather Honing Wheel (Front Base / Edge Trailing with +0.2° Micro-Bump)
- **Inputs**: $D = 215.00\text{ mm}$, $A = 139.00\text{ mm}$, $\beta = 15.00^\circ$, $\Delta\beta = +0.20^\circ$, Base = Front
- **Outputs**:
  - Effective Angle: $\beta_{\text{total}} = 15.20^\circ$
  - **$h_r = 104.91\text{ mm}$**
  - **$CA = 206.411\text{ mm}$**
  - **$y = 158.850\text{ mm}$**
  - **$h_n = 113.55\text{ mm}$**

---

## 🎯 Dual-Base Machine Calibration Solver

Calibration solves for the physical offsets $(h_c, o)$ from caliper measurements.

### Caliper Measurement Input
Outer-to-outer measurement $CA_o$ between Axle ($D_a$) and USB ($D_s$):
$$CA = CA_o - \frac{D_a}{2} - \frac{D_s}{2}$$

### Theoretical Model
For any datum height setting $h_n$:
$$y = h_n + h_c - \frac{D_s}{2}$$
$$CA_{\text{calc}}(h_c, o) = \sqrt{y^2 + o^2}$$

### Optimization Goal
Given $N \ge 2$ paired observations $(h_{n,i}, CA_i)$, find $(h_c, o)$ to minimize:
$$S(h_c, o) = \sum_{i=1}^N \left( CA_{\text{calc},i}(h_c, o) - CA_i \right)^2$$

### Residual Diagnostics
- Individual residual: $\varepsilon_i = CA_{\text{calc},i} - CA_i$
- Maximum absolute error: $\varepsilon_{\max} = \max_i |\varepsilon_i|$
- Quality Rating:
  - $\varepsilon_{\max} \le 0.05\text{ mm}$: ⭐ **Excellent** (Sub-tenth millimeter accuracy)
  - $\varepsilon_{\max} \le 0.10\text{ mm}$: ✅ **Good** (Standard shop caliper accuracy)
  - $\varepsilon_{\max} > 0.20\text{ mm}$: ⚠️ **Caution** (Re-measure points)

---

## 🎯 Inverse Projection Solver (`computeRequiredProjection`)

For adjustable jigs (e.g. knife jigs with micro-adjuster stop collars, KJ-45 with collar stop, CATRA, FVB) used with a fixed USB bar position measured from either the machine datum ($h_n$) or the wheel surface ($h_r$).

### 1. Known Distance Axle/Wheel Centre $\leftrightarrow$ USB Centre ($CA$)
- **Fixed Datum Base Height ($h_n$)**:
  $$y = h_n + h_c - \frac{D_s}{2}$$
  $$CA = \sqrt{y^2 + o^2}$$
- **Fixed Wheel Surface Height ($h_r$)**:
  $$CA = h_r + R - \frac{D_s}{2}$$

### 2. Exact Algebraic Inverse Solution for Projection $A$
Given wheel radius $R = D/2$, jig collar diameter $D_j$, and effective angle $\beta_{\text{total}} = \beta + \Delta\beta_{\text{step}}$:
$$CJ = \frac{D_j}{2} + \frac{D_s}{2}$$
$$\beta_{\text{rad}} = \frac{\beta_{\text{total}} \cdot \pi}{180}$$

Expanding the Dutchman Law of Cosines into a quadratic for $jg = A - D_s/2$:
$$jg^2 + 2 R \sin(\beta_{\text{rad}}) \cdot jg + \left( CJ^2 + R^2 - 2 R CJ \cos(\beta_{\text{rad}}) - CA^2 \right) = 0$$

Solving the quadratic yields:
$$\text{Discriminant Term} = CA^2 - (R \cos\beta_{\text{rad}} - CJ)^2$$

- If $\text{Discriminant Term} < 0$, the target angle is physically unreachable with the fixed USB position.
- Otherwise:
  $$jg = -R \sin\beta_{\text{rad}} + \sqrt{CA^2 - (R \cos\beta_{\text{rad}} - CJ)^2}$$
  $$A = jg + \frac{D_s}{2}$$

### 🧪 Inverse Golden Master Test Cases
- **Case 1 (Rear Base / Edge Leading)**:
  - Setup: Rear Base, $h_n = 168.4836\text{ mm}$, $D = 250.00\text{ mm}$, $\beta = 15.00^\circ$, $D_s = 12.00\text{ mm}$, $D_j = 12.00\text{ mm}$
  - Output: **$A = 139.00\text{ mm}$**
- **Case 2 (Front Base / Edge Trailing Honing with +0.2° Bump)**:
  - Setup: Front Base, $h_n = 85.2830\text{ mm}$, $D = 215.00\text{ mm}$, $\beta = 15.00^\circ$, $\Delta\beta = +0.20^\circ$, $D_s = 12.00\text{ mm}$, $D_j = 12.00\text{ mm}$
  - Output: **$A = 139.00\text{ mm}$** (Exact round-trip identity).


