import math

Da = 12.0
Ds = 12.0
Ra = Da / 2
Rs = Ds / 2
targetResidualMm = 0.02

def calibrateBase(rows):
    CA = []
    hn = []
    for r in rows:
        CA.append(r['CAo'] - Ra - Rs)
        hn.append(r['hn'])
        
    N = len(CA)
    if N < 2: return None
    
    Sh = Sh2 = Sb = Sbh = 0
    for i in range(N):
        h = hn[i]
        b = CA[i]*CA[i] - h*h
        Sh += h
        Sh2 += h*h
        Sb += b
        Sbh += h*b
        
    D = N * Sh2 - Sh * Sh
    if abs(D) < 1e-9: return None
    
    t = (N * Sbh - Sh * Sb) / (2 * D)
    K = (Sh2 * Sb - Sh * Sbh) / D
    
    o2 = K - t*t
    if o2 <= 0: return None
    
    hc = t
    o = math.sqrt(o2)
    
    maxRes = 0
    for i in range(N):
        expected_CA = math.sqrt((hn[i] + hc)**2 + o**2)
        res = abs(CA[i] - expected_CA)
        if res > maxRes: maxRes = res
        
    return hc, o, maxRes

def solveWithSmartPruning(rows):
    if len(rows) < 5:
        return calibrateBase(rows)
    
    full = calibrateBase(rows)
    if full and full[2] <= targetResidualMm:
        return full
        
    best = None
    lowest = float('inf')
    best_idx = -1
    for i in range(len(rows)):
        subset = [r for idx, r in enumerate(rows) if idx != i]
        res = calibrateBase(subset)
        if res and res[2] < lowest:
            lowest = res[2]
            best = res
            best_idx = i
            
    if best:
        return best
    return full

def get_error_deg(res):
    hc, o, maxRes = res
    # roughly, 0.02 mm = 0.015 deg.
    # We will just print the maxRes for now.
    return maxRes

rows = [
    {'hn': 90.0, 'CAo': 219.97},
    {'hn': 135.0, 'CAo': 264.44},
    {'hn': 112.5, 'CAo': 242.18},
    {'hn': 100.0, 'CAo': 229.88}, # +0.05
    {'hn': 125.0, 'CAo': 256.54}, # +2.0
    {'hn': 120.0, 'CAo': 249.59},
    {'hn': 105.0, 'CAo': 234.77},
]

bestError = None
count = 0

for i in range(4, 8):
    res = solveWithSmartPruning(rows[:i])
    err = res[2] # we use maxRes for tracking
    if bestError is None or err < bestError - 0.0001:
        count = 0
        bestError = err
    else:
        count += 1
    print(f"Step {i+1} (N={i}) -> maxRes: {err:.5f}, count: {count}")

