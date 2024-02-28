import { useEffect, useState } from "react";
import { baseUrl, getRequest } from "../utils/services";

export const useFetchRecipientUser = (chat, user) => {
    const [recipientUser, setRecipientUser] = useState(null);

    const [error, setError] = useState(null);

    // tìm 1 user có id khác với id người đang đăng nhập
    const recipientId = chat?.members.find((id) => id !== user?._id);

    useEffect(() => {
        const getUser = async () => {
            if (!recipientId) return null;

            // gọi api lấy thông tin người nhận
            const response = await getRequest(
                `${baseUrl}/users/find/${recipientId}`
            );

            if (response.error) {
                return setError(response?.message);
            }

            setRecipientUser(response);
        };

        getUser();
    }, [recipientId]);

    return { recipientUser };
};
