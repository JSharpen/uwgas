import math

Da = 12.0
Ds = 12.0
Ra = Da / 2
Rs = Ds / 2

rows5 = [
    {'hn': 90.0, 'CAo': 219.97},
    {'hn': 135.0, 'CAo': 264.44},
    {'hn': 112.5, 'CAo': 242.18},
    {'hn': 100.0, 'CAo': 229.88}, # +0.05
    {'hn': 125.0, 'CAo': 256.54}, # +2.0
]
CA = []
hn = []
for r in rows5:
    CA.append(r['CAo'] - Ra - Rs)
    hn.append(r['hn'])
    
N = len(CA)
Sh = Sh2 = Sb = Sbh = 0
for i in range(N):
    h = hn[i]
    b = CA[i]*CA[i] - h*h
    Sh += h
    Sh2 += h*h
    Sb += b
    Sbh += h*b
    
D = N * Sh2 - Sh * Sh
t = (N * Sbh - Sh * Sb) / (2 * D)
K = (Sh2 * Sb - Sh * Sbh) / D

o2 = K - t*t
print(f"o2: {o2}")
