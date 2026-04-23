export default function Input({ label, type = "text", name, id = name, placeholder = "" }) {
  return (
    <div className="input-group">
      <label className="input-group__label" htmlFor={id}>{label}</label>
      <input className="input" id={id} name={name} type={type} placeholder={placeholder} />
    </div>
  );
}
