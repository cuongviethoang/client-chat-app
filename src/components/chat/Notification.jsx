import { useContext, useState } from "react";
import { ChatContext } from "../../context/ChatContext";
import { AuthContext } from "../../context/AuthContext";
import { unreadNotifications } from "../../utils/unreadNotifications";
import moment from "moment";

const Notification = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { user } = useContext(AuthContext);
    const {
        notifications,
        userChats,
        allUsers,
        markAllNotificationsAsRead,
        markNotificationAsRead,
    } = useContext(ChatContext);

    // nhận mảng thông báo chưa đọc(isRead = false)
    const unread = unreadNotifications(notifications);

    // trả về mảng tất cả thông báo chứ các obj gồm {senderId,isRead,date,senderName}
    const modifiedNotifications = notifications.map((n) => {
        const sender = allUsers.find((user) => user._id === n.senderId);
        return {
            ...n,
            senderName: sender?.name,
        };
    });

    return (
        <div className="notifications">
            <div
                className="notifications-icon"
                onClick={() => setIsOpen(!isOpen)}
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    fill="currentColor"
                    className="bi bi-chat-right-dots-fill"
                    viewBox="0 0 16 16"
                >
                    <path d="M16 2a2 2 0 0 0-2-2H2a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h9.586a1 1 0 0 1 .707.293l2.853 2.853a.5.5 0 0 0 .854-.353zM5 6a1 1 0 1 1-2 0 1 1 0 0 1 2 0m4 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0m3 1a1 1 0 1 1 0-2 1 1 0 0 1 0 2" />
                </svg>
                {unread?.length === 0 ? null : (
                    <span className="notification-count">
                        <span>{unread?.length}</span>
                    </span>
                )}
            </div>
            {isOpen ? (
                <div className="notifications-box">
                    <div className="notifications-header">
                        <h3>Notifications</h3>
                        <div
                            className="mark-as-read"
                            onClick={() =>
                                markAllNotificationsAsRead(notifications)
                            }
                        >
                            Mark all as read
                        </div>
                    </div>
                    {modifiedNotifications?.length === 0 ? (
                        <span className="notification">
                            No notification yet...
                        </span>
                    ) : null}
                    {modifiedNotifications &&
                        modifiedNotifications.map((notify, index) => {
                            return (
                                <div
                                    key={`notify-${index}`}
                                    className={
                                        notify?.isRead
                                            ? "notification"
                                            : "notification not-read"
                                    }
                                    onClick={() => {
                                        markNotificationAsRead(
                                            notify,
                                            userChats,
                                            user,
                                            notifications
                                        ),
                                            setIsOpen(false);
                                    }}
                                >
                                    <span>{`${notify.senderName} send you a new message`}</span>
                                    <span className="notification-time">
                                        {moment(notify.date).calendar()}
                                    </span>
                                </div>
                            );
                        })}
                </div>
            ) : null}
        </div>
    );
};

export default Notification;
