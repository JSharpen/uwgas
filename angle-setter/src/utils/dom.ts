import * as React from 'react';

export function blurOnEnter(e: React.KeyboardEvent<HTMLInputElement>) {
  if (e.key === 'Enter') {
    (e.currentTarget as HTMLInputElement).blur();
  }
}
