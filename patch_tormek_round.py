with open('src/math/tormek.ts', 'r') as f:
    text = f.read()

text = text.replace("return optimalHn;", "return Math.round(optimalHn);")

text = text.replace("""  return [
    minHn + span * 0.50, // Point 3: Midpoint
    minHn + span * 0.25, // Point 4: Lower-mid
    minHn + span * 0.75, // Point 5: Upper-mid
  ];""", """  return [
    Math.round(minHn + span * 0.50), // Point 3: Midpoint
    Math.round(minHn + span * 0.25), // Point 4: Lower-mid
    Math.round(minHn + span * 0.75), // Point 5: Upper-mid
  ];""")

with open('src/math/tormek.ts', 'w') as f:
    f.write(text)
