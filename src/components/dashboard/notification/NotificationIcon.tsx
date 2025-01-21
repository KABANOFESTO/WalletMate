import React, { useState, useEffect } from 'react';
import { Bell } from '@phosphor-icons/react';
import { Badge, IconButton, Menu, MenuItem, Typography, Box, Stack, Divider } from '@mui/material';
import { useAuth } from '@/hooks/use-auth';
import { notificationService, type Notification } from '@/services/notification';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'react-hot-toast';

export default function NotificationIcon(): JSX.Element {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const fetchNotifications = async () => {
    if (!user?.id) return;
    try {
      const data = await notificationService.getNotifications(Number(user.id));
      setNotifications(data);
      setUnreadCount(data.filter(n => !n.isRead).length);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      toast.error('Failed to fetch notifications');
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Poll for new notifications every minute
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, [user?.id]);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMarkAsRead = async (notification: Notification) => {
    try {
      await notificationService.markAsRead(notification.id);
      await fetchNotifications();
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      toast.error('Failed to mark notification as read');
    }
  };

  const handleDelete = async (notification: Notification) => {
    try {
      await notificationService.deleteNotification(notification.id);
      await fetchNotifications();
      toast.success('Notification deleted');
    } catch (error) {
      console.error('Failed to delete notification:', error);
      toast.error('Failed to delete notification');
    }
  };

  return (
    <>
      <IconButton
        onClick={handleClick}
        sx={{
          position: 'relative',
          p: 1,
          color: 'text.primary',
        }}
      >
        <Badge badgeContent={unreadCount} color="error">
          <Bell size={24} />
        </Badge>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          sx: {
            width: 360,
            maxHeight: 480,
            mt: 1.5,
            '& .MuiMenuItem-root': {
              px: 2,
              py: 1,
              typography: 'body2',
              borderRadius: 0.75,
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', py: 2, px: 2.5 }}>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="subtitle1">Notifications</Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              You have {unreadCount} unread messages
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ borderStyle: 'dashed' }} />

        <Stack sx={{ maxHeight: 340, overflow: 'auto' }}>
          {notifications.length === 0 ? (
            <MenuItem>No notifications</MenuItem>
          ) : (
            notifications.map((notification) => (
              <MenuItem
                key={notification.id}
                onClick={() => handleMarkAsRead(notification)}
                sx={{
                  bgcolor: notification.isRead ? 'transparent' : 'action.hover',
                  '&:hover': {
                    bgcolor: 'action.hover',
                  },
                }}
              >
                <Stack direction="row" alignItems="center" spacing={2} sx={{ width: '100%' }}>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="body2" noWrap>
                      {notification.message}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ color: 'text.secondary', mt: 0.5, display: 'block' }}
                    >
                      {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                    </Typography>
                  </Box>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(notification);
                    }}
                    sx={{ color: 'text.secondary' }}
                  >
                    <Bell size={16} />
                  </IconButton>
                </Stack>
              </MenuItem>
            ))
          )}
        </Stack>
      </Menu>
    </>
  );
}
