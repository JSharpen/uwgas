import math

hc = 115.00
o = 35.00
Ra = 125.00
Rs = 6.00

def get_cao(hn):
    ca = math.sqrt((hn + hc)**2 + o**2)
    return ca + Ra + Rs

# True values
hns = [90, 95, 100, 105, 110, 115, 120, 125, 130, 135]

for hn in hns:
    cao = get_cao(hn)
    print(f"hn: {hn:5.2f} | CAo: {cao:.4f}")

