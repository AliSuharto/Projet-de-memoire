import { Search } from "lucide-react";

type SearchBarProps = {
  searchTerm: string;
  onSearchChange: (value: string) => void;
};

const SearchBar: React.FC<SearchBarProps> = ({ searchTerm, onSearchChange }) => (
  <div className="relative mb-4">
    <Search
      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
      size={20}
    />
    <input
      type="text"
      placeholder="Rechercher..."
      value={searchTerm}
      onChange={(e) => onSearchChange(e.target.value)}
      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
    />
  </div>
);

export default SearchBar;
