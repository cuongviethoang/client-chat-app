import { useContext } from "react";
import { ChatContext } from "../../context/ChatContext";
import { AuthContext } from "../../context/AuthContext";
import { useFetchRecipientUser } from "../../hooks/useFetchRecipient";
import { Stack } from "react-bootstrap";
import moment from "moment"; // dùng thư viện này để convert thời gian trong db

const ChatBox = () => {
    const { user } = useContext(AuthContext);
    const { currentChat, messages, isMessagesLoading, messageError } =
        useContext(ChatContext);
    const { recipientUser } = useFetchRecipientUser(currentChat, user);

    console.log(">> check message: ", messages);
    console.log(">> check recipientUser: ", recipientUser);

    if (!recipientUser)
        return (
            <p style={{ textAlign: "center", width: "100%" }}>
                No conversation selected yet...
            </p>
        );

    if (isMessagesLoading)
        return (
            <p style={{ textAlign: "center", width: "100%" }}>
                Loading chat...
            </p>
        );

    return (
        <Stack gap={4} className="chat-box">
            <div className="chat-header">
                <strong>{recipientUser?.name}</strong>
            </div>
            <Stack gap={3} className="messages">
                {messages &&
                    messages.map((message, index) => (
                        <Stack
                            key={`message-${index}`}
                            className={`${
                                message?.senderId === user?._id
                                    ? "message self align-self-end flex-grow-0"
                                    : "message align-self-start flex-grow-0"
                            }`}
                        >
                            <span>{message.text}</span>
                            <span className="message-footer">
                                {moment(message.createdAt).calendar()}
                            </span>
                        </Stack>
                    ))}
            </Stack>
        </Stack>
    );
};

export default ChatBox;
