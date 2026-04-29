import AppKit

let url = URL(fileURLWithPath: CommandLine.arguments[1])
if let image = NSImage(contentsOf: url),
   let cgImage = image.cgImage(forProposedRect: nil, context: nil, hints: nil) {
    let bitmap = NSBitmapImageRep(cgImage: cgImage)
    if let color = bitmap.colorAt(x: Int(image.size.width/2), y: Int(image.size.height/2)) {
        if let rgbColor = color.usingColorSpace(.deviceRGB) {
            print(String(format: "#%02lX%02lX%02lX", Int(rgbColor.redComponent*255), Int(rgbColor.greenComponent*255), Int(rgbColor.blueComponent*255)))
        }
    }
}
