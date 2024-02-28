import { useContext } from "react";
import { ChatContext } from "../../context/ChatContext";
import { AuthContext } from "../../context/AuthContext";

// Comp để render ra những người mà ta chưa chat với
const PotentialChats = () => {
    const { user } = useContext(AuthContext);
    const { potentialChats, createChat } = useContext(ChatContext);

    return (
        <>
            <div className="all-users">
                {potentialChats &&
                    potentialChats.length > 0 &&
                    potentialChats.map((u, index) => (
                        <div
                            className="single-user"
                            key={`user-${index}`}
                            onClick={() => createChat(user._id, u._id)}
                        >
                            {u.name}
                            <span className="user-online"></span>
                        </div>
                    ))}
            </div>
        </>
    );
};

export default PotentialChats;
