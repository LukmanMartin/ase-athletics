import { useParams } from 'react-router-dom';
import PlayerForm from '../../components/PlayerForm/PlayerForm';

const EditPlayer = () => {
    const { id } = useParams();
    return <PlayerForm mode="edit" playerId={id} />;
};

export default EditPlayer;