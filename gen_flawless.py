import math

target_hc = 115.00
target_o = 35.00
Da = 12.00
Ds = 12.00
Ra = Da / 2
Rs = Ds / 2

# internally, t is hc - Rs
t = target_hc - Rs

def get_cao(hn):
    ca = math.sqrt((hn + t)**2 + target_o**2)
    return ca + Ra + Rs

hns = [90.00, 135.00, 112.50, 101.00]

print("| Step | `hn` (Datum) | `CAo` (Axle Top) | Expected Behavior |")
print("|:---:|:---:|:---:|---|")
for i, hn in enumerate(hns):
    cao = get_cao(hn)
    print(f"| {i+1} | `{hn:.2f}` | `{cao:.2f}` | Flawless mathematical fit |")

