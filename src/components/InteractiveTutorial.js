import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  XMarkIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  PlayIcon,
  CheckCircleIcon,
  LightBulbIcon,
  WalletIcon,
  ArrowsRightLeftIcon,
  CogIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { useAppStore } from '../store/useAppStore';

const tutorialSteps = [
  {
    id: 'welcome',
    title: '🎉 Bienvenue sur DEX Swap App !',
    description: 'Découvrez comment échanger vos cryptomonnaies en toute sécurité et simplicité.',
    content: (
      <div className="text-center">
        <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full flex items-center justify-center">
          <PlayIcon className="w-10 h-10 text-white" />
        </div>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          Ce tutoriel vous guidera à travers toutes les fonctionnalités de l'application en quelques minutes.
        </p>
        <div className="bg-primary-50 dark:bg-primary-900/20 rounded-lg p-4">
          <p className="text-sm text-primary-700 dark:text-primary-300">
            💡 <strong>Astuce :</strong> Vous pouvez reprendre ce tutoriel à tout moment depuis les paramètres.
          </p>
        </div>
      </div>
    ),
    target: null,
    position: 'center'
  },
  {
    id: 'connect-wallet',
    title: '🔐 Connecter votre wallet',
    description: 'La première étape consiste à connecter votre portefeuille MetaMask.',
    content: (
      <div>
        <div className="flex items-center mb-4">
          <WalletIcon className="w-8 h-8 text-primary-500 mr-3" />
          <h4 className="text-lg font-semibold">Connexion sécurisée</h4>
        </div>
        <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
          <li className="flex items-center">
            <CheckCircleIcon className="w-4 h-4 text-green-500 mr-2" />
            Vos clés privées restent dans votre wallet
          </li>
          <li className="flex items-center">
            <CheckCircleIcon className="w-4 h-4 text-green-500 mr-2" />
            Aucune donnée personnelle stockée
          </li>
          <li className="flex items-center">
            <CheckCircleIcon className="w-4 h-4 text-green-500 mr-2" />
            Transactions signées localement
          </li>
        </ul>
        <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
          <p className="text-sm text-yellow-700 dark:text-yellow-300">
            ⚠️ Assurez-vous d'avoir MetaMask installé et configuré.
          </p>
        </div>
      </div>
    ),
    target: '.connect-wallet-btn',
    position: 'bottom'
  },
  {
    id: 'select-tokens',
    title: '🪙 Sélectionner les tokens',
    description: 'Choisissez les tokens que vous souhaitez échanger.',
    content: (
      <div>
        <div className="flex items-center mb-4">
          <ArrowsRightLeftIcon className="w-8 h-8 text-primary-500 mr-3" />
          <h4 className="text-lg font-semibold">Sélection intelligente</h4>
        </div>
        <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
          <li className="flex items-center">
            <CheckCircleIcon className="w-4 h-4 text-green-500 mr-2" />
            Recherche rapide par nom ou symbole
          </li>
          <li className="flex items-center">
            <CheckCircleIcon className="w-4 h-4 text-green-500 mr-2" />
            Affichage des soldes en temps réel
          </li>
          <li className="flex items-center">
            <CheckCircleIcon className="w-4 h-4 text-green-500 mr-2" />
            Tokens favoris pour un accès rapide
          </li>
        </ul>
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            💡 Cliquez sur l'étoile pour ajouter un token à vos favoris !
          </p>
        </div>
      </div>
    ),
    target: '.token-selector',
    position: 'right'
  },
  {
    id: 'enter-amount',
    title: '💰 Saisir le montant',
    description: 'Entrez le montant que vous souhaitez échanger.',
    content: (
      <div>
        <div className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
          <div className="flex items-start">
            <span className="bg-primary-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-3 mt-0.5">1</span>
            <div>
              <p className="font-medium">Saisissez le montant</p>
              <p>Tapez directement dans le champ ou utilisez le bouton "MAX"</p>
            </div>
          </div>
          <div className="flex items-start">
            <span className="bg-primary-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-3 mt-0.5">2</span>
            <div>
              <p className="font-medium">Prix calculé automatiquement</p>
              <p>Le prix est mis à jour en temps réel via Uniswap v3</p>
            </div>
          </div>
          <div className="flex items-start">
            <span className="bg-primary-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-3 mt-0.5">3</span>
            <div>
              <p className="font-medium">Vérifiez les détails</p>
              <p>Impact sur le prix, frais de gas, slippage</p>
            </div>
          </div>
        </div>
      </div>
    ),
    target: '.amount-input',
    position: 'top'
  },
  {
    id: 'advanced-settings',
    title: '⚙️ Paramètres avancés',
    description: 'Personnalisez votre expérience de trading.',
    content: (
      <div>
        <div className="flex items-center mb-4">
          <CogIcon className="w-8 h-8 text-primary-500 mr-3" />
          <h4 className="text-lg font-semibold">Contrôle total</h4>
        </div>
        <div className="space-y-3">
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
            <h5 className="font-medium text-gray-900 dark:text-white mb-1">Slippage</h5>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Tolérance aux variations de prix (recommandé: 0.5-1%)
            </p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
            <h5 className="font-medium text-gray-900 dark:text-white mb-1">Mode développeur</h5>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Affiche les détails techniques des transactions
            </p>
          </div>
        </div>
      </div>
    ),
    target: '.settings-btn',
    position: 'left'
  },
  {
    id: 'transaction-details',
    title: '📊 Détails de transaction',
    description: 'Comprenez tous les aspects de votre swap.',
    content: (
      <div>
        <div className="flex items-center mb-4">
          <ChartBarIcon className="w-8 h-8 text-primary-500 mr-3" />
          <h4 className="text-lg font-semibold">Transparence totale</h4>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
            <h5 className="font-medium text-green-700 dark:text-green-300">Prix unitaire</h5>
            <p className="text-green-600 dark:text-green-400">Taux de change actuel</p>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
            <h5 className="font-medium text-blue-700 dark:text-blue-300">Impact prix</h5>
            <p className="text-blue-600 dark:text-blue-400">Effet sur le marché</p>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3">
            <h5 className="font-medium text-purple-700 dark:text-purple-300">Frais gas</h5>
            <p className="text-purple-600 dark:text-purple-400">Coût de transaction</p>
          </div>
          <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-3">
            <h5 className="font-medium text-orange-700 dark:text-orange-300">Min. reçu</h5>
            <p className="text-orange-600 dark:text-orange-400">Avec slippage</p>
          </div>
        </div>
      </div>
    ),
    target: '.transaction-details',
    position: 'top'
  },
  {
    id: 'complete',
    title: '🎊 Félicitations !',
    description: 'Vous maîtrisez maintenant DEX Swap App !',
    content: (
      <div className="text-center">
        <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
          <CheckCircleIcon className="w-10 h-10 text-white" />
        </div>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          Vous êtes maintenant prêt à échanger vos cryptomonnaies en toute sécurité !
        </p>
        <div className="bg-gradient-to-r from-primary-50 to-accent-50 dark:from-primary-900/20 dark:to-accent-900/20 rounded-lg p-4">
          <h5 className="font-semibold text-gray-900 dark:text-white mb-2">Prochaines étapes :</h5>
          <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
            <li>• Connectez votre wallet MetaMask</li>
            <li>• Commencez par un petit montant pour tester</li>
            <li>• Explorez les paramètres avancés</li>
            <li>• Ajoutez vos tokens favoris</li>
          </ul>
        </div>
      </div>
    ),
    target: null,
    position: 'center'
  }
];

const InteractiveTutorial = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const { hasCompletedOnboarding, setOnboardingComplete, ui, updateUI } = useAppStore();

  useEffect(() => {
    if (!hasCompletedOnboarding || ui.showTutorial) {
      setIsVisible(true);
    }
  }, [hasCompletedOnboarding, ui.showTutorial]);

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    setOnboardingComplete();
    updateUI({ showTutorial: false });
    setIsVisible(false);
    setCurrentStep(0);
  };

  const handleSkip = () => {
    setOnboardingComplete();
    updateUI({ showTutorial: false });
    setIsVisible(false);
    setCurrentStep(0);
  };

  const step = tutorialSteps[currentStep];
  const progress = ((currentStep + 1) / tutorialSteps.length) * 100;

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      >
        {/* Spotlight effect */}
        {step.target && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0 bg-black/70" />
            <div 
              className="absolute bg-transparent rounded-lg shadow-[0_0_0_9999px_rgba(0,0,0,0.7)]"
              style={{
                // Position dynamique basée sur l'élément cible
                top: '50%',
                left: '50%',
                width: '200px',
                height: '100px',
                transform: 'translate(-50%, -50%)'
              }}
            />
          </div>
        )}

        <motion.div
          key={currentStep}
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: -20 }}
          className={`
            relative w-full max-w-lg mx-4 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden
            ${step.position === 'center' ? '' : 'max-w-md'}
          `}
        >
          {/* Progress bar */}
          <div className="h-1 bg-gray-200 dark:bg-gray-700">
            <motion.div
              className="h-full bg-gradient-to-r from-primary-500 to-accent-500"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>

          {/* Header */}
          <div className="p-6 pb-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <span className="bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 px-2 py-1 rounded-full text-xs font-medium">
                  {currentStep + 1} / {tutorialSteps.length}
                </span>
                <LightBulbIcon className="w-5 h-5 text-yellow-500 ml-2" />
              </div>
              <button
                onClick={handleSkip}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
            
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              {step.title}
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              {step.description}
            </p>
          </div>

          {/* Content */}
          <div className="px-6 pb-6">
            {step.content}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 dark:bg-gray-800 px-6 py-4 flex items-center justify-between">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className={`
                flex items-center px-4 py-2 rounded-lg font-medium transition-all
                ${currentStep === 0
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }
              `}
            >
              <ArrowLeftIcon className="w-4 h-4 mr-2" />
              Précédent
            </button>

            <div className="flex space-x-2">
              {tutorialSteps.map((_, index) => (
                <div
                  key={index}
                  className={`
                    w-2 h-2 rounded-full transition-all
                    ${index === currentStep
                      ? 'bg-primary-500 w-6'
                      : index < currentStep
                      ? 'bg-green-500'
                      : 'bg-gray-300 dark:bg-gray-600'
                    }
                  `}
                />
              ))}
            </div>

            <button
              onClick={handleNext}
              className="flex items-center px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-medium transition-colors"
            >
              {currentStep === tutorialSteps.length - 1 ? (
                <>
                  Terminer
                  <CheckCircleIcon className="w-4 h-4 ml-2" />
                </>
              ) : (
                <>
                  Suivant
                  <ArrowRightIcon className="w-4 h-4 ml-2" />
                </>
              )}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default InteractiveTutorial;
