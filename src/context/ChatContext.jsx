import { createContext, useCallback, useEffect, useState } from "react";
import { baseUrl, getRequest, postRequest } from "../utils/services";
import { io } from "socket.io-client";

export const ChatContext = createContext();

export const ChatContextProvider = ({ children, user }) => {
    const [userChats, setUserChats] = useState(null);
    const [isUserChatsLoading, setIsUserChatsLoading] = useState(false);
    const [userChatsError, setUserChatsError] = useState(null);
    const [potentialChats, setPotentialChats] = useState([]);
    const [currentChat, setCurrentChat] = useState(null);
    const [messages, setMessages] = useState(null);
    const [isMessagesLoading, setIsMessagesLoading] = useState(false);
    const [messageError, setMessageError] = useState(null);
    const [sendTextMessageError, setSendTextMessageError] = useState(null);
    const [newMessage, setNewMessage] = useState(null);
    const [socket, setSocket] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [allUsers, setAllUsers] = useState([]);

    // Khởi tạo socket
    useEffect(() => {
        const newSocket = io("http://localhost:3000"); // cổng 300 là server của socket
        setSocket(newSocket);
        // cleanup function
        return () => {
            newSocket.disconnect();
        };
    }, [user]);

    // client phát ra sự kiện có tên là addNewUser(khi có người dùng đăng nhập vào hệ thống sẽ tự đọng gửi 1 sự kiện đến socket )
    useEffect(() => {
        if (socket === null) return;
        // bắn đi event tên là addNewUser
        socket.emit("addNewUser", user?._id);
        // nhận 1 event tên là getOnlineUsers
        socket.on("getOnlineUsers", (res) => {
            console.log(">> Online users: ", res);
            setOnlineUsers(res);
        });
    }, [socket]);

    //send message
    useEffect(() => {
        if (socket === null) return;

        const recipientId = currentChat?.members.find((id) => id !== user?._id);

        socket.emit("sendMessage", { ...newMessage, recipientId });
    }, [newMessage]);

    //receive message and notification(chỉ thực hiện đoạn code này ở bên người nhận, bên gửi không chạy vào hàm này)
    useEffect(() => {
        if (socket === null) return;

        socket.on("getMessage", (res) => {
            // nếu hộp chat hiện tại không phải là hộp chat đang muốn gửi tin nhắn
            if (currentChat?._id !== res?.chatId) return;
            console.log(">> chech message current 2: ", [...messages, res]);

            setMessages((prev) => [...prev, res]);
        });

        socket.on("getNotification", (res) => {
            // kiểm tra xem bảng chat có được mở hay đang đóng
            // nếu mở thì thuộc tính isRead là true
            // nếu chưa mở thì isRead là false
            const isChatOpen = currentChat?.members.some(
                (id) => id === res.senderId
            );

            if (isChatOpen) {
                // vì gửi 1 thông báo từ server socket lên client mặc định là false -> sửa thành true
                setNotifications((prev) => [{ ...res, isRead: true }, ...prev]);
            } else {
                setNotifications((prev) => [res, ...prev]);
            }
        });

        return () => {
            socket.off("getMessage");
            socket.off("getNotification");
        };
    }, [socket, currentChat]);

    useEffect(() => {
        const getUsers = async () => {
            // gọi api lất tất cả user từ db
            const response = await getRequest(`${baseUrl}/users`);

            if (response.error) {
                return console.log("Error fetching users: ", response);
            }

            // lọc tất cả user trong db và trả về những user mà chưa chát với người đang đăng nhập
            const pChats = response.filter((u) => {
                let isChatCreated = false;

                if (user?._id === u._id) return false;

                if (userChats) {
                    isChatCreated = userChats?.some((chat) => {
                        return (
                            chat.members[0] === u._id ||
                            chat.members[1] === u._id
                        );
                    });
                }

                return !isChatCreated;
            });

            console.log(">> Users haven't chatted: ", pChats);
            setPotentialChats(pChats);
            setAllUsers(response);
        };
        getUsers();
    }, [userChats]);

    useEffect(() => {
        const getUserChats = async () => {
            if (user?._id) {
                setIsUserChatsLoading(true);
                setUserChatsError(null);

                // gọi api lấy tất cả các cuộc chat mà người dùng đã tham gia vào,(select vào model chat để tìm)
                const response = await getRequest(
                    `${baseUrl}/chats/${user?._id}`
                );

                setIsUserChatsLoading(false);

                if (response.error) {
                    return setUserChatsError(response);
                }

                console.log(">> check user chatted: ", response);
                setUserChats(response);
            }
        };

        getUserChats();
    }, [user, notifications]);

    useEffect(() => {
        const getMessages = async () => {
            setIsMessagesLoading(true);
            setMessageError(null);

            // gọi api lấy tất cả các cuộc chat mà người dùng đã tham gia vào,(select vào model chat để tìm)
            const response = await getRequest(
                `${baseUrl}/messages/${currentChat?._id}`
            );

            setIsMessagesLoading(false);

            if (response.error) {
                return setMessageError(response?.message);
            }
            setMessages(response);
        };

        getMessages();
    }, [currentChat]);

    const sendTextMessage = useCallback(
        async (textMessage, sender, currentChatId, setTextMessage) => {
            if (!textMessage) return console.log("You must type something ...");

            const response = await postRequest(
                `${baseUrl}/messages`,
                JSON.stringify({
                    chatId: currentChatId,
                    senderId: sender._id,
                    text: textMessage,
                })
            );

            if (response?.error) {
                return setSendTextMessageError(response?.message);
            }

            setNewMessage(response);
            setMessages((prev) => [...prev, response]);
            setTextMessage("");
        },
        []
    );

    const updateCurrentChat = useCallback((chat) => {
        console.log(">> Current Chat: ", chat);
        setCurrentChat(chat);
    }, []);

    const createChat = useCallback(async (firstId, secondId) => {
        const response = await postRequest(
            `${baseUrl}/chats`,
            JSON.stringify({ firstId, secondId })
        );

        if (response.error) {
            return console.log("Error creating chat", response);
        }

        setUserChats((prev) => [...prev, response]);
    }, []);

    // khi click vào "mark all notification" sẽ đánh dấu tất cả
    // thông báo là đã đọc
    const markAllNotificationsAsRead = useCallback((notifications) => {
        const mNotifications = notifications.map((n) => {
            return { ...n, isRead: true };
        });

        setNotifications(mNotifications);
    }, []);

    // khi click vào 1 thông báo trong list thông báo sẽ đánh dấu
    // thông báo tin nhắn đó đã đọc
    const markNotificationAsRead = useCallback(
        (notify, userChats, user, notifications) => {
            // tìm đoạn chat khi click sẽ hiện lên
            const desiredChat = userChats.find((chat) => {
                const chatMembers = [user._id, notify.senderId];
                const isDesiredChat = chat?.members.every((member) => {
                    return chatMembers.includes(member);
                });
                return isDesiredChat;
            });

            // mark notification as read
            const mNotifications = notifications.map((item) => {
                if (notify.senderId === item.senderId) {
                    return {
                        ...notify,
                        isRead: true,
                    };
                } else {
                    return item;
                }
            });

            // mở đoạn chat mong muốn
            updateCurrentChat(desiredChat);
            // cập nhật lại 1 số thông báo đã được cập nhật isRead: true
            setNotifications(mNotifications);
        },
        []
    );

    // click vào 1 userChat trong list userChats
    // nếu có thông báo chưa đọc sẽ được đặt lại thành isRead: true
    const markThisUserNotificationsAsRead = useCallback(
        (thisUserNotifications, notifications) => {
            // mark notifications as read
            const mNotifications = notifications.map((item) => {
                let notification;

                thisUserNotifications.forEach((n) => {
                    if (n.senderId === item.senderId) {
                        notification = { ...n, isRead: true };
                    } else {
                        notification = item;
                    }
                });
                return notification;
            });

            setNotifications(mNotifications);
        },
        []
    );

    return (
        <ChatContext.Provider
            value={{
                userChats,
                isUserChatsLoading,
                userChatsError,
                potentialChats,
                createChat,
                updateCurrentChat,
                messages,
                isMessagesLoading,
                messageError,
                currentChat,
                sendTextMessage,
                onlineUsers,
                notifications,
                allUsers,
                markAllNotificationsAsRead,
                markNotificationAsRead,
                markThisUserNotificationsAsRead,
            }}
        >
            {children}
        </ChatContext.Provider>
    );
};
