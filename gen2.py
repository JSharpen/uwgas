import math

hc = 115.00
o = 35.00
Ra = 6.00
Rs = 6.00

def get_cao(hn):
    ca = math.sqrt((hn + hc)**2 + o**2)
    return ca + Ra + Rs

hns = [90, 135, 112.5, 100, 125, 120, 105]

print("| Step | `hn` | `CAo` | Notes |")
print("|:---:|:---:|:---:|---|")

for i, hn in enumerate(hns):
    cao = get_cao(hn)
    
    note = ""
    val = cao
    if i == 3: # step 4
        val = cao + 0.05
        note = "**[+0.05mm Variance]**"
    elif i == 4: # step 5
        val = cao + 2.00
        note = f"**[+2.00mm Massive Outlier]** (True is {cao:.2f})"
    else:
        note = "Perfect fit"
        
    print(f"| {i+1} | `{hn:.2f}` | `{val:.2f}` | {note} |")

