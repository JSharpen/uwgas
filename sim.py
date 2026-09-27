import math

Da = 250.0
Ds = 12.0
Ra = Da / 2
Rs = Ds / 2

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

rows = [
    {'hn': 90.0, 'CAo': 338.97},
    {'hn': 135.0, 'CAo': 383.44},
    {'hn': 112.5, 'CAo': 361.18},
    {'hn': 100.0, 'CAo': 348.87} # +0.04 error
]
print("4 points:", calibrateBase(rows))

rows5 = rows + [{'hn': 125.0, 'CAo': 375.54}] # +2.0 outlier
# simulate smart pruning
best = None
lowest = float('inf')
best_idx = -1
for i in range(len(rows5)):
    subset = [r for idx, r in enumerate(rows5) if idx != i]
    res = calibrateBase(subset)
    if res and res[2] < lowest:
        lowest = res[2]
        best = res
        best_idx = i
print("5 points pruned (dropped idx", best_idx, "):", best)

rows6 = rows5 + [{'hn': 120.0, 'CAo': 368.59}]
best = None
lowest = float('inf')
best_idx = -1
for i in range(len(rows6)):
    subset = [r for idx, r in enumerate(rows6) if idx != i]
    res = calibrateBase(subset)
    if res and res[2] < lowest:
        lowest = res[2]
        best = res
        best_idx = i
print("6 points pruned (dropped idx", best_idx, "):", best)

