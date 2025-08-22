import { GetServerSideProps } from 'next';

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.params!;


  
  // Ici, vous pourriez faire un appel API
  const res = await fetch(`https://api.example.com/items/${id}`);
  const data = await res.json();

  return {
    props: { data },
  };
};

interface ItemData {
  title: string;
  description: string;
}

export default function ItemPage({ data }: { data: ItemData }) {
  return (
    <div>
      <h1>{data.title}</h1>
      <p>{data.description}</p>
    </div>
  );
}