'use client';

import * as React from 'react';
import Badge from '@mui/material/Badge';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import NotificationsIcon from '@mui/icons-material/Notifications';
import Typography from '@mui/material/Typography';
import { notificationService, Notification } from '@/services/notification';
import { useAuth } from '@/hooks/use-auth';
import { formatDistanceToNow } from 'date-fns';

export default function NotificationIcon() {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [notifications, setNotifications] = React.useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = React.useState(0);
  const { user } = useAuth();
  const open = Boolean(anchorEl);

  const fetchNotifications = React.useCallback(async () => {
    if (user?.id) {
      const data = await notificationService.getNotifications(user.id);
      setNotifications(data);
      setUnreadCount(data.filter(n => !n.isRead).length);
    }
  }, [user?.id]);

  React.useEffect(() => {
    fetchNotifications();
    // Poll for new notifications every minute
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.isRead) {
      await notificationService.markAsRead(notification.id);
      fetchNotifications();
    }
    handleClose();
  };

  const formatDate = (date: string) => {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  };

  return (
    <>
      <IconButton
        onClick={handleClick}
        size="large"
        color={unreadCount > 0 ? "primary" : "default"}
      >
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          sx: {
            maxHeight: 400,
            width: '300px',
          },
        }}
      >
        {notifications.length === 0 ? (
          <MenuItem>
            <Typography>No notifications</Typography>
          </MenuItem>
        ) : (
          notifications.map((notification) => (
            <MenuItem
              key={notification.id}
              onClick={() => handleNotificationClick(notification)}
              sx={{
                whiteSpace: 'normal',
                bgcolor: notification.isRead ? 'transparent' : 'action.hover',
              }}
            >
              <div>
                <Typography variant="body1" sx={{ mb: 0.5 }}>
                  {notification.message}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {formatDate(notification.createdAt)}
                </Typography>
              </div>
            </MenuItem>
          ))
        )}
      </Menu>
    </>
  );
}
