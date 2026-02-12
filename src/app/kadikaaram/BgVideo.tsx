export default function BgVideo() {
 const bgVideoUrl = "https://ycmatcrayxzipphjkkao.supabase.co/storage/v1/object/public/Titanium2025Bucket/cdn/about.mp4";

    return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <video
        className="w-full h-full object-cover"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
      >
        <source src={bgVideoUrl} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  );
}
