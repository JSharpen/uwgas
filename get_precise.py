import math

target_hc = 115.00
target_o = 35.00
Da = 12.00
Ds = 12.00
Ra = Da / 2
Rs = Ds / 2

t = target_hc - Rs

def get_cao(hn):
    ca = math.sqrt((hn + t)**2 + target_o**2)
    return ca + Ra + Rs

hns = [90.00, 135.00, 112.50, 101.00]
for hn in hns:
    print(f"hn: {hn:.2f} -> CAo: {get_cao(hn):.3f}")
