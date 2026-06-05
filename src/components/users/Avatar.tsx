interface AvatarProps {
  name: string | null;
  url?: string | null;
}

export default function Avatar({ name, url }: AvatarProps) {
  if (url)
    return (
      <img
        src={url}
        alt=""
        style={{
          width: 38,
          height: 38,
          borderRadius: "50%",
          objectFit: "cover",
        }}
      />
    );

  const initials = name
    ? name
        .split(" ")
        .map((p) => p[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "??";

  return (
    <div
      style={{
        width: 38,
        height: 38,
        borderRadius: "50%",
        background: "linear-gradient(135deg,#2563eb,#6366f1)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#fff",
        fontSize: 13,
        fontWeight: 700,
        flexShrink: 0,
      }}
    >
      {initials}
    </div>
  );
}
