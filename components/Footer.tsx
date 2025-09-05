// components/Footer.tsx
export default function Footer() {
  return (
    <footer className="bg-gray-100 text-gray-600 text-center py-4 border-t border-gray-200 z-10">
      <p className="text-sm">
        © {new Date().getFullYear()} e-GMC. Tous droits réservés.
      </p>
    </footer>
  );
}
