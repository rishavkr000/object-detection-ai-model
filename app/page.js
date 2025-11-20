import ObjectDetection from "@/components/object-detection";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen items-center p-8">
      <h1 className="gradient-title font-extrabold text-3xl md:text-6xl lg:text-8xl tracking-tighter md:px-6 text-center">Object Detection Camera</h1>
      <ObjectDetection />
    </div>
  );
}
