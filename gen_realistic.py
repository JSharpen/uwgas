import math
import random

target_hc = 115.00
target_o = 35.00
Da = 12.00
Ds = 12.00
Ra = 6.0
Rs = 6.0
t_val = target_hc - Rs

def get_cao(hn):
    ca = math.sqrt((hn + t_val)**2 + target_o**2)
    return ca + Ra + Rs

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
    
    hc = t + Rs
    o = math.sqrt(o2)
    
    maxRes = 0
    for i in range(N):
        expected_CA = math.sqrt((hn[i] + hc - Rs)**2 + o**2)
        res = abs(CA[i] - expected_CA)
        if res > maxRes: maxRes = res
        
    return hc, o, maxRes

def solveWithSmartPruning(rows):
    if len(rows) < 5:
        return calibrateBase(rows)
    
    full = calibrateBase(rows)
    if full and full[2] <= 0.02:
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

# Realistic scenario with noise
random.seed(42)

hns = [90.0, 135.0, 112.5, 101.0, 123.0, 118.0, 107.0]
rows = []
for i, hn in enumerate(hns):
    true_cao = get_cao(hn)
    
    # inject noise
    if i == 0:
        cao = true_cao + 0.02
    elif i == 1:
        cao = true_cao - 0.03
    elif i == 2:
        cao = true_cao + 0.01
    elif i == 3:
        cao = true_cao - 0.04
    elif i == 4:
        cao = true_cao + 1.85 # huge outlier
    elif i == 5:
        cao = true_cao + 0.03
    elif i == 6:
        cao = true_cao - 0.02
        
    rows.append({'hn': hn, 'CAo': round(cao, 2)})

for i in range(len(rows)):
    print(f"| {i+1} | `{rows[i]['hn']:.2f}` | `{rows[i]['CAo']:.2f}` |")

print("\nSimulation:")
bestError = None
count = 0

for i in range(4, 8):
    res = solveWithSmartPruning(rows[:i])
    err = res[2]
    if bestError is None or err < bestError - 0.0001:
        count = 0
        bestError = err
    else:
        count += 1
    print(f"Step {i+1} (N={i}) -> hc: {res[0]:.4f}, o: {res[1]:.4f}, maxRes: {err:.5f}, count: {count}")

