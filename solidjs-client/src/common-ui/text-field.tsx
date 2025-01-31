interface TextFieldProps {
  label: string
  placeholder?: string
  type?: string
  fullWidth?: boolean
  required?: boolean
  autoComplete?: string
  name?: string
  variant?: "outlined" | "filled"
  class?: string
}

export const TextField = (props: TextFieldProps) => {
  const {
    label,
    placeholder = "",
    type = "text",
    fullWidth = false,
    required = false,
    autoComplete,
    name,
    variant = "outlined",
    class: className = "",
  } = props

  const variantClass =
    variant === "filled"
      ? "bg-gray-100 border border-gray-300 focus:bg-white"
      : "border border-gray-300"

  return (
    <div class={`flex flex-col ${fullWidth ? "w-full" : ""} ${className}`}>
      <label class="mb-1 text-sm font-medium text-gray-700">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        required={required}
        auto-complete={autoComplete}
        name={name}
        class={`px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${variantClass}`}
      />
    </div>
  )
}
