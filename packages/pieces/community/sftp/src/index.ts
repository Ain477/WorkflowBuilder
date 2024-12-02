import {
  PieceAuth,
  Property,
  createPiece,
} from '@activepieces/pieces-framework';
import { PieceCategory } from '@activepieces/shared';
import Client from 'ssh2-sftp-client';
import { Client as FTPClient } from 'basic-ftp';
import { createFile } from './lib/actions/create-file';
import { uploadFileAction } from './lib/actions/upload-file';
import { readFileContent } from './lib/actions/read-file';
import { newOrModifiedFile } from './lib/triggers/new-modified-file';
import { deleteFolderAction } from './lib/actions/delete-folder';
import { deleteFileAction } from './lib/actions/delete-file';
import { listFolderContentsAction } from './lib/actions/list-files';
import { createFolderAction } from './lib/actions/create-folder';
import { renameFileOrFolderAction } from './lib/actions/rename-file-or-folder';

export async function getClient<T extends Client | FTPClient>(auth: { protocol: string, host: string, port: number, username: string, password: string }) {
  const { protocol, host, port, username, password } = auth;

  if (protocol === 'sftp') {
    const sftp = new Client();
    await sftp.connect({
      host,
      port,
      username,
      password,
      timeout: 10000,
    });
    return sftp as T;
  } else {
    const ftpClient = new FTPClient();
    await ftpClient.access({
      host,
      port,
      user: username,
      password,
      secure: protocol === 'ftps',
    });
    return ftpClient as T;
  }
}

export async function endClient(client: Client | FTPClient) {
  if (client instanceof Client) {
    await client.end();
  } else {
    client.close();
  }
}

export const sftpAuth = PieceAuth.CustomAuth({
  description: 'Enter the authentication details',
  props: {
    protocol: Property.StaticDropdown({
      displayName: 'Protocol',
      description: 'The protocol to use',
      required: true,
      options: {
        options: [
          { value: 'sftp', label: 'SFTP' },
          { value: 'ftp', label: 'FTP' },
          { value: 'ftps', label: 'FTPS' }
        ],
      },
    }),
    host: Property.ShortText({
      displayName: 'Host',
      description: 'The host of the server',
      required: true,
    }),
    port: Property.Number({
      displayName: 'Port',
      description: 'The port of the server',
      required: true,
      defaultValue: 22,
    }),
    username: Property.ShortText({
      displayName: 'Username',
      description: 'The username to authenticate with',
      required: true,
    }),
    password: PieceAuth.SecretText({
      displayName: 'Password',
      description: 'The password to authenticate with',
      required: true,
    }),
  },
  validate: async ({ auth }) => {
    try {
      switch(auth.protocol) {
        case 'sftp':{
          const client = await getClient<Client>(auth);
          await client.end();
          break;
        }
        default: {
          const client = await getClient<FTPClient>(auth);
          client.close();
          break;
        }
      }
      return {
        valid: true,
      };
    } catch (err) {
      return {
        valid: false,
        error: 'Connection failed. Please check your credentials and try again.',
      };
    }
  },
  required: true,
});

export const ftpSftp = createPiece({
  displayName: 'FTP/SFTP',
  description: 'Connect to FTP, FTPS or SFTP servers',
  minimumSupportedRelease: '0.30.0',
  logoUrl: 'https://cdn.activepieces.com/pieces/sftp.svg',
  categories: [PieceCategory.CORE, PieceCategory.DEVELOPER_TOOLS],
  authors: [
    'Abdallah-Alwarawreh',
    'kishanprmr',
    'AbdulTheActivePiecer',
    'khaledmashaly',
    'abuaboud',
  ],
  auth: sftpAuth,
  actions: [
    createFile,
    uploadFileAction,
    readFileContent,
    deleteFileAction,
    createFolderAction,
    deleteFolderAction,
    listFolderContentsAction,
    renameFileOrFolderAction,
  ],
  triggers: [newOrModifiedFile],
});
