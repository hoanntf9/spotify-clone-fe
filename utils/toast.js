const colors = {
  success: "linear-gradient(to right, #1db954, #88f4ae)",
  error: "linear-gradient(to right, #f44336, #e57373)",
  warn: "linear-gradient(to right, #ff9800, #ffc107)",
  info: "linear-gradient(to right, #2196f3, #03a9f4)",
};

export function toast({
  text = "",
  type = "success",
  duration = 3000,
  gravity = "top",
  position = "center",
}) {
  Toastify({
    text,
    type,
    duration,
    close: true,
    gravity,
    position,
    stopOnFocus: true,
    style: {
      background: colors[type],
      minWidth: "200px",
      display: "flex",
      justifyContent: "space-between",
      fontSize: "14px",
      borderRadius: "12px",
      color: "#f2f2f2",
    },
    onClick: function () { },
  }).showToast();
}
