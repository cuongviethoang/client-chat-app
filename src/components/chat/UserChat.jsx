import { Stack } from "react-bootstrap";
import { useFetchRecipientUser } from "../../hooks/useFetchRecipient";
import avatar from "../../assets/avatar.svg";
import { useContext } from "react";
import { ChatContext } from "../../context/ChatContext";
import { unreadNotifications } from "../../utils/unreadNotifications";
import moment from "moment";
import { useFetchLatestMessage } from "../../hooks/useFetchLatestMessage";

const UserChats = ({ chat, user }) => {
    // trả về thông tin của người đã chat với chính mình
    const { recipientUser } = useFetchRecipientUser(chat, user);

    const { onlineUsers, notifications, markThisUserNotificationsAsRead } =
        useContext(ChatContext);

    // trả về tin nhắn cuối cùng của chính mình và người còn lại trong đoạn chat
    const { latestMessage } = useFetchLatestMessage(chat);

    // trả về mảng thông báo chưa đọc của của mình
    // gồm tất cả thông báo chưa đọc của tát cả user khác gửi đến
    const unreadNotify = unreadNotifications(notifications);

    // lọc trả về mảng tất cả thông báo của 1 người gửi cụ thể(recipientUser?._id) đến mình
    const thisUserNotifications = unreadNotify?.filter(
        (n) => n.senderId === recipientUser?._id
    );

    // check 1 người dùng có đang onl hay không
    const isOnline = onlineUsers?.some(
        (onlUser) => onlUser?.userId === recipientUser?._id
    );

    // rút gọn message cuối cùng trong đoạn chat
    const truncateText = (text) => {
        let shortText = text.substring(0, 20);

        if (text.length > 20) {
            shortText = shortText + "...";
        }

        return shortText;
    };

    return (
        <Stack
            direction="horizontal"
            gap={3}
            className="user-card align-items-center p-2 justify-content-between"
            role="button"
            onClick={() => {
                if (thisUserNotifications?.length !== 0) {
                    markThisUserNotificationsAsRead(
                        thisUserNotifications,
                        notifications
                    );
                }
            }}
        >
            <div className="d-flex">
                <div className="me-2">
                    <img src={avatar} alt="avatar" height="35px" />
                </div>
                <div className="text-content">
                    <div className="name">{recipientUser?.name}</div>
                    <div className="text">
                        {latestMessage?.text && (
                            <span>{truncateText(latestMessage?.text)}</span>
                        )}
                    </div>
                </div>
            </div>
            <div className="d-flex flex-column align-items-end">
                <div className="date">
                    {moment(latestMessage?.createdAt).calendar()}
                </div>
                <div
                    className={
                        thisUserNotifications &&
                        thisUserNotifications?.length > 0
                            ? "this-user-notifications"
                            : ""
                    }
                >
                    {thisUserNotifications?.length > 0 &&
                        thisUserNotifications.length}
                </div>
                <div className={isOnline ? "user-online" : ""}></div>
            </div>
        </Stack>
    );
};

export default UserChats;
