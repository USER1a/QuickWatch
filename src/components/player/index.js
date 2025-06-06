import { setupIPhoneSupport } from './checkiPhone.js';
import { setupPlayerData } from './savePlayerData.js';
import { setupTopControls } from './ui/topControls.js';
import { setupKeybinds } from './keybinds.js';
import { setupPreviewVideo } from './ui/previewVideo.js';
import { setupProgressBar, formatTime } from './ui/progressBar.js';
import { setupQualityOptions } from './ui/qualityOptions.js';
import { setupVolumeControls } from './ui/volume.js';
import { setupPlayPause } from './ui/playPause.js';
import { setupFullscreenPiP } from './ui/fullscreenPiP.js';
import { setupDownloadVideo } from './downloadVideo.js';
import { setupSubtitles } from './ui/subtitles.js';
import { setupSkipButtons } from './ui/skipButtons.js';

export function initializeCustomPlayer(playerContainer, linksData, showId, episodeNumber, isNativeEmbed = false, subtitleTracks = [], mediaType = 'tv') {
  // get player elements
  const player = playerContainer.querySelector('#custom-player');
  const customPlayer = playerContainer.querySelector('.custom-player');
  const playPauseBtn = playerContainer.querySelector('.play-pause-btn');
  const centerPlayButton = playerContainer.querySelector('.center-play-button');
  const volumeBtn = playerContainer.querySelector('.volume-btn');
  const volumeSlider = playerContainer.querySelector('.volume-slider');
  const volumeLevel = playerContainer.querySelector('.volume-level');
  const progressContainerHitbox = playerContainer.querySelector('.progress-container-hitbox');
  const progressContainer = playerContainer.querySelector('.progress-container');
  const progressBar = playerContainer.querySelector('.progress-bar');
  const progressThumb = playerContainer.querySelector('.progress-thumb');
  const currentTimeEl = playerContainer.querySelector('.current-time');
  const timeDisplay = playerContainer.querySelector('.time-display');
  const fullscreenBtn = playerContainer.querySelector('.fullscreen-btn');
  const qualityToggleBtn = playerContainer.querySelector('.quality-toggle-btn');
  const iphoneQualityMenu = playerContainer.querySelector('.iphone-quality-menu');
  const qualityBtn = playerContainer.querySelector('.quality-btn');
  const qualityMenu = playerContainer.querySelector('.quality-menu');
  const subtitleBtn = playerContainer.querySelector('.subtitle-btn');
  const subtitleMenu = playerContainer.querySelector('.subtitle-menu');
  const bufferBar = playerContainer.querySelector('.buffer-bar');
  const videoPreview = playerContainer.querySelector('.video-preview');
  const previewTime = playerContainer.querySelector('.preview-time');
  const pipBtn = playerContainer.querySelector('.pip-btn');
  const aspectToggleBtn = playerContainer.querySelector('.aspect-toggle-btn');
  const topControls = playerContainer.querySelector('.top-controls');
  const volumeContainer = playerContainer.querySelector('.volume-container');
  const backwardBtn = playerContainer.querySelector('.back-10s');
  const forwardBtn = playerContainer.querySelector('.forwards-10s');
  
  if (!player) return;
  
  // iPhone support
  const isIPhone = setupIPhoneSupport(player, customPlayer, topControls);
  
  // set saved player data (volume, timestamp)
  setupPlayerData(player, volumeLevel, showId, episodeNumber, mediaType);
  
  // set top controls
  const { showTopControls } = setupTopControls(topControls, aspectToggleBtn, player);
  
  // set volume controls
  const { mute, updateVolumeIcon, showVolumeSlider } = setupVolumeControls(
    player, volumeBtn, volumeSlider, volumeLevel, volumeContainer
  );
  
  // setup keybinds
  setupKeybinds(player, customPlayer, mute, showVolumeSlider, volumeLevel, updateVolumeIcon);
  
  // srtup preview video
  setupPreviewVideo(videoPreview, player, progressContainerHitbox, progressContainer, previewTime, linksData, isNativeEmbed);
  
  // setup progress bar
  setupProgressBar(
    player, progressContainerHitbox, progressContainer, progressBar, 
    progressThumb, currentTimeEl, timeDisplay, bufferBar, formatTime
  );
  
  // setup play/pause controls
  setupPlayPause(player, playPauseBtn, centerPlayButton);
  
  // setup fullscreen and PiP
  setupFullscreenPiP(player, customPlayer, fullscreenBtn, pipBtn);

  // setup skip buttons
  setupSkipButtons(player, backwardBtn, forwardBtn);
  
  // store subtitle handler for cleanup
  let subtitleHandler = null;
  
  // setup quality options or subtitles
  if (isNativeEmbed) {
    // check if we have quality options in linksData
    const hasQualityOptions = Array.isArray(linksData) && linksData.length > 0;
    
    if (subtitleBtn && subtitleMenu) {
      subtitleHandler = setupSubtitles(player, subtitleBtn, subtitleMenu);
      subtitleHandler.loadSubtitles(subtitleTracks);
      
      if (qualityBtn && !hasQualityOptions) { 
        qualityBtn.parentElement.classList.add('hidden'); 
      }
    }
    
    if (hasQualityOptions && qualityBtn && qualityMenu) {
      setupQualityOptions(
        qualityMenu, iphoneQualityMenu, qualityBtn, qualityToggleBtn, 
        player, customPlayer, linksData, isIPhone, true // isNativeEmbed=true
      );
    }
  } else {
    setupQualityOptions(
      qualityMenu, iphoneQualityMenu, qualityBtn, qualityToggleBtn, 
      player, customPlayer, linksData, isIPhone, false // isNativeEmbed=false
    );
    
    if (subtitleBtn) { subtitleBtn.parentElement.classList.add('hidden'); }
  }
  
  const downloadBtn = playerContainer.querySelector('.download-btn');
  setupDownloadVideo(downloadBtn, player, linksData);
  
  let controlsTimeout;
  
  const showControls = () => {
    const playerControls = playerContainer.querySelector('.player-controls');
    if (!playerControls) return;
    
    playerControls.classList.remove('opacity-0');
    
    if (controlsTimeout) {
      clearTimeout(controlsTimeout);
    }
    
    controlsTimeout = setTimeout(() => {
      playerControls.classList.add('opacity-0');
    }, 2000);
  };
  
  customPlayer.addEventListener('mousemove', () => {
    showControls();
    showTopControls();
  });
  
  // initially show controls 
  showControls();
  
  // clean up function for when player is destroyed
  const cleanup = () => {
    if (subtitleHandler && subtitleHandler.cleanup) {
      subtitleHandler.cleanup();
    }
  };
  
  player.cleanup = cleanup;
  
  return {
    player,
    cleanup
  };
}