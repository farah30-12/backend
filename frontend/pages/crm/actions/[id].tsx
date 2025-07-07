/*import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import axios from 'axios';

export default function ActionDetail() {
  const { id } = useRouter().query;
  const [action, setAction] = useState(null);

  useEffect(() => {
    if (id) {
      axios.get(`http://localhost:8080/api/actions/${id}`).then((res) => {
        setAction(res.data);
      });
    }
  }, [id]);

  if (!action) return <p>Chargement...</p>;

  return <div>{action.objet}</div>;
}
*/