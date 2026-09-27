with open('src/components/CalibrationWizard.tsx', 'r') as f:
    text = f.read()

# the outer div of the forms inside step === 'measuring'
#         <div className="relative z-10 flex flex-col gap-4 w-full pb-4">
#           <div className="flex items-center justify-between">
old = """        return (
          <div className="relative z-10 flex flex-col gap-4 w-full pb-4">
            <div className="flex items-center justify-between">"""
new = """        return (
          <div key={measIndex} className="relative z-10 flex flex-col gap-4 w-full pb-4">
            <div className="flex items-center justify-between">"""
if old in text:
    text = text.replace(old, new)
else:
    print("Could not find inputs wrapper")

with open('src/components/CalibrationWizard.tsx', 'w') as f:
    f.write(text)
