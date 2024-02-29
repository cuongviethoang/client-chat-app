import { useContext, useEffect, useState } from "react";
import { ChatContext } from "../context/ChatContext";
import { baseUrl, getRequest } from "../utils/services";

export const useFetchLatestMessage = (chat) => {
    const { newMessage, notifications } = useContext(ChatContext);
    const [latestMessage, setLatestMessage] = useState(null);

    useEffect(() => {
        const getMessage = async () => {
            // gọi api lấy ra tất cả message trong hoại thoại chat
            const response = await getRequest(
                `${baseUrl}/messages/${chat?._id}`
            );

            if (response.error) {
                return console.log(
                    "Error getting messages...",
                    response.message
                );
            }

            const lastMessage = response[response?.length - 1];

            setLatestMessage(lastMessage);
        };
        getMessage();
    }, [newMessage, notifications]);

    return { latestMessage };
};
