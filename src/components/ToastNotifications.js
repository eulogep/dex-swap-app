import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XCircleIcon,
  XMarkIcon,
  ArrowTopRightOnSquareIcon
} from '@heroicons/react/24/outline';
import { useToastStore } from '../store/useAppStore';

const toastIcons = {
  success: CheckCircleIcon,
  error: XCircleIcon,
  warning: ExclamationTriangleIcon,
  info: InformationCircleIcon,
};

const toastColors = {
  success: {
    bg: 'bg-green-50 dark:bg-green-900/20',
    border: 'border-green-200 dark:border-green-800',
    icon: 'text-green-500',
    title: 'text-green-800 dark:text-green-200',
    description: 'text-green-700 dark:text-green-300',
    button: 'text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300'
  },
  error: {
    bg: 'bg-red-50 dark:bg-red-900/20',
    border: 'border-red-200 dark:border-red-800',
    icon: 'text-red-500',
    title: 'text-red-800 dark:text-red-200',
    description: 'text-red-700 dark:text-red-300',
    button: 'text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300'
  },
  warning: {
    bg: 'bg-yellow-50 dark:bg-yellow-900/20',
    border: 'border-yellow-200 dark:border-yellow-800',
    icon: 'text-yellow-500',
    title: 'text-yellow-800 dark:text-yellow-200',
    description: 'text-yellow-700 dark:text-yellow-300',
    button: 'text-yellow-600 hover:text-yellow-700 dark:text-yellow-400 dark:hover:text-yellow-300'
  },
  info: {
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    border: 'border-blue-200 dark:border-blue-800',
    icon: 'text-blue-500',
    title: 'text-blue-800 dark:text-blue-200',
    description: 'text-blue-700 dark:text-blue-300',
    button: 'text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300'
  },
};

const ToastItem = ({ toast }) => {
  const { removeToast } = useToastStore();
  const IconComponent = toastIcons[toast.type];
  const colors = toastColors[toast.type];

  const handleClose = () => {
    removeToast(toast.id);
  };

  const handleAction = () => {
    if (toast.action?.onClick) {
      toast.action.onClick();
    }
    if (toast.action?.autoClose !== false) {
      handleClose();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.3 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
      className={`
        relative w-full max-w-sm mx-auto rounded-xl border shadow-lg backdrop-blur-sm
        ${colors.bg} ${colors.border}
      `}
    >
      {/* Progress bar pour la durée */}
      {toast.duration > 0 && (
        <motion.div
          className="absolute top-0 left-0 h-1 bg-current rounded-t-xl opacity-30"
          initial={{ width: '100%' }}
          animate={{ width: '0%' }}
          transition={{ duration: toast.duration / 1000, ease: 'linear' }}
        />
      )}

      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <IconComponent className={`w-6 h-6 ${colors.icon}`} />
          </div>
          
          <div className="ml-3 flex-1">
            {toast.title && (
              <h3 className={`text-sm font-semibold ${colors.title}`}>
                {toast.title}
              </h3>
            )}
            
            {toast.description && (
              <p className={`text-sm ${toast.title ? 'mt-1' : ''} ${colors.description}`}>
                {toast.description}
              </p>
            )}

            {/* Transaction hash */}
            {toast.txHash && (
              <div className="mt-2 flex items-center space-x-2">
                <span className={`text-xs ${colors.description}`}>
                  Transaction: {toast.txHash.slice(0, 6)}...{toast.txHash.slice(-4)}
                </span>
                <button
                  onClick={() => window.open(`https://etherscan.io/tx/${toast.txHash}`, '_blank')}
                  className={`${colors.button} transition-colors`}
                >
                  <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Action button */}
            {toast.action && (
              <div className="mt-3">
                <button
                  onClick={handleAction}
                  className={`
                    text-sm font-medium underline transition-colors
                    ${colors.button}
                  `}
                >
                  {toast.action.label}
                </button>
              </div>
            )}
          </div>

          {/* Close button */}
          <div className="ml-4 flex-shrink-0">
            <button
              onClick={handleClose}
              className={`
                inline-flex rounded-md p-1.5 transition-colors
                ${colors.button}
                hover:bg-black/5 dark:hover:bg-white/5
              `}
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const ToastNotifications = () => {
  const { toasts } = useToastStore();

  return (
    <div className="fixed top-4 right-4 z-50 space-y-3 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <ToastItem toast={toast} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
};

// Hook pour utiliser facilement les toasts
export const useToast = () => {
  const { addToast } = useToastStore();

  const toast = {
    success: (title, description, options = {}) => {
      return addToast({
        type: 'success',
        title,
        description,
        ...options,
      });
    },
    
    error: (title, description, options = {}) => {
      return addToast({
        type: 'error',
        title,
        description,
        duration: 0, // Les erreurs ne se ferment pas automatiquement
        ...options,
      });
    },
    
    warning: (title, description, options = {}) => {
      return addToast({
        type: 'warning',
        title,
        description,
        ...options,
      });
    },
    
    info: (title, description, options = {}) => {
      return addToast({
        type: 'info',
        title,
        description,
        ...options,
      });
    },

    // Toasts spécialisés pour les transactions
    transactionPending: (txHash) => {
      return addToast({
        type: 'info',
        title: 'Transaction en cours',
        description: 'Votre transaction est en cours de traitement...',
        txHash,
        duration: 0,
      });
    },

    transactionSuccess: (txHash, details = {}) => {
      return addToast({
        type: 'success',
        title: 'Transaction confirmée !',
        description: details.description || 'Votre swap a été exécuté avec succès.',
        txHash,
        action: {
          label: 'Voir sur Etherscan',
          onClick: () => window.open(`https://etherscan.io/tx/${txHash}`, '_blank'),
        },
        duration: 8000,
      });
    },

    transactionError: (error, txHash = null) => {
      return addToast({
        type: 'error',
        title: 'Erreur de transaction',
        description: error.message || 'Une erreur est survenue lors de la transaction.',
        txHash,
        duration: 0,
      });
    },

    // Toast pour l'ajout de token à MetaMask
    tokenAdded: (tokenSymbol) => {
      return addToast({
        type: 'success',
        title: 'Token ajouté !',
        description: `${tokenSymbol} a été ajouté à votre wallet MetaMask.`,
        duration: 5000,
      });
    },

    // Toast pour les alertes de prix
    priceAlert: (tokenSymbol, currentPrice, targetPrice, direction) => {
      return addToast({
        type: 'warning',
        title: `Alerte prix ${tokenSymbol}`,
        description: `Le prix a ${direction === 'above' ? 'dépassé' : 'chuté sous'} ${targetPrice}$ (actuellement ${currentPrice}$)`,
        duration: 0,
        action: {
          label: 'Voir le graphique',
          onClick: () => {
            // Ouvrir le graphique ou naviguer vers la page de trading
          },
        },
      });
    },

    // Toast pour les mises à jour de l'app
    appUpdate: () => {
      return addToast({
        type: 'info',
        title: 'Mise à jour disponible',
        description: 'Une nouvelle version de l\'application est disponible.',
        action: {
          label: 'Actualiser',
          onClick: () => window.location.reload(),
        },
        duration: 0,
      });
    },
  };

  return toast;
};

export default ToastNotifications;
