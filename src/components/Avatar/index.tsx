import React from 'react';
import { Upload, Avatar as AntdAvatar } from 'antd';
import type { AvatarProps as AntdAvatarProps } from 'antd/lib/avatar/avatar';
import './index.less';

type Props = Pick<AntdAvatarProps, 'className' | 'shape' | 'size'> & {
  avatarSrc?: string;
};

export const Avatar: React.FC<Props> = ({
  avatarSrc,
  className,
  shape = 'circle',
  size = 'default',
}) => {
  return (
    <div className={`avatar ${!avatarSrc ? 'avatar-hidden' : ''}`}>
      {avatarSrc ? (
        <AntdAvatar
          className={className}
          src={avatarSrc}
          shape={shape}
          size={size}
        />
      ) : (
        <span className="avatar-upload-tip">头像地址为空</span>
      )}
    </div>
  );
};
