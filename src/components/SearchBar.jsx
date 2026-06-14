function SearchBar({ placeholder = "Pesquisar...", value, onChange }) {
  return (
    <input
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className="w-full md:w-96 border border-slate-300 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-900"
    />
  );
}

export default SearchBar;