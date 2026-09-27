import math

Da = 12.0
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

rows5 = [
    {'hn': 90.0, 'CAo': 219.97},
    {'hn': 135.0, 'CAo': 264.44},
    {'hn': 112.5, 'CAo': 242.18},
    {'hn': 100.0, 'CAo': 229.88}, # +0.05
    {'hn': 125.0, 'CAo': 256.54}, # +2.0
]
print("5 points full:", calibrateBase(rows5))
