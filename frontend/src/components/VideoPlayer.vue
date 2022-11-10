<script setup>
  import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
  import { useARStore } from '@/stores/ar'

  const props = defineProps({
    src: {
      type: String,
      default: '',
    },
    fileMime: {
      type: String,
      default: '',
    },
    options: { type: Array, default: () => [] },
  })

  const arStore = useARStore()

  const videoPlayer = ref(null)
  const videoPlayerContainer = ref(null)
  const durationTime = ref(0)
  const currentTime = ref(0)
  const playPercent = ref(0)
  const isPlaying = ref(false)
  const showControls = ref(true)
  const currentTimeString = ref('00:00')
  const durationTimeString = ref('00:00')
  const timeline = ref(null)
  const isMuted = ref(false)
  const isFullscreen = ref(false)
  const isCursorOver = ref(false)
  const isPicInPic = ref(false)

  const showVolumeButton = computed(() => {
    return !props.options.includes('hideVolumeButton')
  })

  const showFullscreenButton = computed(() => {
    return !props.options.includes('hideFullscreenButton')
  })

  const showPicInPicButton = computed(() => {
    return (
      !props.options.includes('hidePicInPicButton') &&
      document.pictureInPictureEnabled
    )
  })

  const srcURL = computed(() => {
    if (props.src) {
      // The "#t=0.1" suffix to the video source URL is a workaround
      // to an issue in which mobile browsers won't show the video initial
      // frame at the beginning, before the video is played:
      return `${props.src}#t=0.1`
    } else return null
  })

  function togglePlayPause() {
    toggleControlsVisible(false)
    if (isPlaying.value) videoPlayer.value.pause()
    else videoPlayer.value.play()
  }

  // Updates the current time and play percent:
  function updatePlayTime() {
    currentTime.value = videoPlayer.value.currentTime
    playPercent.value =
      100 * (videoPlayer.value.currentTime / durationTime.value)

    currentTimeString.value = new Date(currentTime.value * 1000)
      .toISOString()
      .slice(14, 19)

    durationTimeString.value = new Date(durationTime.value * 1000)
      .toISOString()
      .slice(14, 19)
  }

  // Adjusts the time of the video player to match the desired timeline position
  // based on click event, playhead position is adjusted automatically:
  function seekVideo(event) {
    videoPlayer.value.currentTime =
      (durationTime.value *
        (event.clientX - timeline.value.getBoundingClientRect().left)) /
      timeline.value.getBoundingClientRect().width
  }

  function setPlayingState(state) {
    isPlaying.value = state
  }

  function toggleMute() {
    if (isMuted.value) {
      videoPlayer.value.muted = false
      isMuted.value = false
    } else {
      videoPlayer.value.muted = true
      isMuted.value = true
    }
  }

  function toggleFullscreen() {
    if (arStore.os === 'Android' || arStore.os === 'other') {
      isFullscreen.value = !isFullscreen.value
      if (!document.fullscreenElement) {
        videoPlayerContainer.value.requestFullscreen().catch((err) => {
          console.error(
            `Error attempting to enable fullscreen mode: ${err.message} (${err.name})`
          )
        })
      } else {
        document.exitFullscreen()
      }
    }
    if (arStore.os === 'iOS') {
      if (!videoPlayer.value.webkitDisplayingFullscreen) {
        videoPlayer.value.webkitEnterFullscreen()
        isFullscreen.value = true
      }
    }
  }

  function togglePictureInPicture() {
    isPicInPic.value = !isPicInPic.value
    if (document.pictureInPictureElement) {
      document.exitPictureInPicture()
    } else {
      if (document.pictureInPictureEnabled) {
        videoPlayer.value.requestPictureInPicture()
      }
    }
  }

  function setDuration() {
    durationTime.value = videoPlayer.value.duration
  }

  function toggleControlsVisible(visible) {
    if (!visible) {
      setTimeout(() => {
        showControls.value = false
      }, 3000)
    } else {
      showControls.value = true
    }
  }

  function handleCursorHover(isHover) {
    if (isHover) {
      isCursorOver.value = true
      toggleControlsVisible(true)
    } else {
      isCursorOver.value = false
      toggleControlsVisible(false)
    }
  }

  function toggleFullscreenOff() {
    isFullscreen.value = false
  }

  function togglePicInPicOff() {
    isPicInPic.value = false
  }

  onMounted(() => {
    videoPlayer.value.addEventListener('loadedmetadata', setDuration)
    videoPlayer.value.addEventListener('timeupdate', updatePlayTime)
    videoPlayer.value.addEventListener('play', setPlayingState.bind(null, true))
    videoPlayer.value.addEventListener(
      'pause',
      setPlayingState.bind(null, false)
    )
    videoPlayer.value.addEventListener(
      'ended',
      setPlayingState.bind(null, false)
    )
    timeline.value.addEventListener('click', seekVideo)

    videoPlayerContainer.value.addEventListener(
      'touchstart',
      toggleControlsVisible.bind(null, true)
    )
    videoPlayerContainer.value.addEventListener(
      'mouseenter',
      handleCursorHover.bind(null, true)
    )
    videoPlayerContainer.value.addEventListener(
      'mousemove',
      toggleControlsVisible.bind(null, true)
    )
    videoPlayerContainer.value.addEventListener(
      'mouseleave',
      handleCursorHover.bind(null, false)
    )

    if (arStore.os === 'iOS') {
      videoPlayer.value.addEventListener(
        'webkitendfullscreen',
        toggleFullscreenOff
      )
    }

    if (document.pictureInPictureEnabled) {
      videoPlayer.value.addEventListener(
        'leavepictureinpicture',
        togglePicInPicOff
      )
    }
  })

  onBeforeUnmount(() => {
    videoPlayer.value.removeEventListener('loadedmetadata', setDuration)
    videoPlayer.value.removeEventListener('timeupdate', updatePlayTime)
    videoPlayer.value.removeEventListener('play', setPlayingState)
    videoPlayer.value.removeEventListener('pause', setPlayingState)
    videoPlayer.value.removeEventListener('ended', setPlayingState)
    timeline.value.removeEventListener('click', seekVideo)

    videoPlayerContainer.value.removeEventListener(
      'touchstart',
      toggleControlsVisible
    )
    videoPlayerContainer.value.removeEventListener(
      'mouseenter',
      handleCursorHover
    )
    videoPlayerContainer.value.removeEventListener(
      'mouseleave',
      handleCursorHover
    )

    videoPlayerContainer.value.removeEventListener(
      'mousemove',
      toggleControlsVisible
    )

    if (arStore.os === 'iOS') {
      videoPlayer.value.removeEventListener(
        'webkitendfullscreen',
        toggleFullscreenOff
      )
    }

    if (document.pictureInPictureEnabled) {
      videoPlayer.value.removeEventListener(
        'leavepictureinpicture',
        togglePicInPicOff
      )
    }
  })
</script>

<template>
  <div v-if="srcURL" ref="videoPlayerContainer" class="video-player-container">
    <video ref="videoPlayer" class="video-player" playsInline="true">
      <source :src="srcURL" :type="fileMime" preload="auto" />
      <track kind="captions" />
      {{ $t('components.videoPlayer.videoNotSupportedMsg') }}
    </video>
    <div
      class="video-controls"
      :class="{ hidden: !showControls, fullscreen: isFullscreen }"
    >
      <button
        class="play-pause-button"
        :aria-label="$t('components.videoPlayer.playPauseButtonLabel')"
        @click="togglePlayPause()"
      >
        <img
          src="@/assets/icons/play-button.svg"
          :alt="$t('components.videoPlayer.playButtonImageAltText')"
          :class="{ hidden: isPlaying }"
        />
        <img
          src="@/assets/icons/pause-button.svg"
          :alt="$t('components.videoPlayer.pauseButtonImageAltText')"
          :class="{ hidden: !isPlaying }"
        />
      </button>
      <div class="timeline-container">
        <div
          class="playhead"
          :style="{
            'margin-left': `calc(${playPercent}% - var(--playhead-width))`,
          }"
        ></div>
        <div ref="timeline" class="timeline-progress-container">
          <div class="timeline-background"></div>
          <div
            class="timeline-played"
            :style="{ width: `${playPercent}%` }"
          ></div>
        </div>
        <span class="current-time-text">
          <p>{{ currentTimeString }}</p>
        </span>
        <span class="duration-text">
          <p>{{ durationTimeString }}</p>
        </span>
      </div>
      <button
        v-if="showVolumeButton"
        :aria-label="$t('components.videoPlayer.toggleSoundButtonLabel')"
        class="volume-button"
        @click="toggleMute()"
      >
        <img
          src="@/assets/icons/volume-icon.svg"
          :alt="$t('components.videoPlayer.soundOnButtonImageAltText')"
          :class="{ hidden: isMuted }"
        />
        <img
          src="@/assets/icons/mute-icon.svg"
          :alt="$t('components.videoPlayer.soundOffButtonImageAltText')"
          :class="{ hidden: !isMuted }"
        />
      </button>
      <button
        v-if="showFullscreenButton"
        class="fullscreen-button"
        :aria-label="$t('components.videoPlayer.fullscreenButtonLabel')"
        @click="toggleFullscreen()"
      >
        <img
          src="@/assets/icons/fullscreen-on-icon.svg"
          :alt="$t('components.videoPlayer.fullscreenButtonImageAltText')"
          :class="{ hidden: isFullscreen }"
        />
        <img
          src="@/assets/icons/fullscreen-off-icon.svg"
          :alt="$t('components.videoPlayer.fullscreenButtonImageAltText')"
          :class="{ hidden: !isFullscreen }"
        />
      </button>
      <button
        v-if="showPicInPicButton"
        class="pic-in-pic-button"
        :aria-label="$t('components.videoPlayer.picInPicButtonLabel')"
        @click="togglePictureInPicture()"
      >
        <img
          src="@/assets/icons/pic-in-pic-on-icon.svg"
          :alt="$t('components.videoPlayer.picInPicOnButtonImageAltText')"
          :class="{ hidden: isPicInPic }"
        />
        <img
          src="@/assets/icons/pic-in-pic-off-icon.svg"
          :alt="$t('components.videoPlayer.picInPicOffButtonImageAltText')"
          :class="{ hidden: !isPicInPic }"
        />
      </button>
    </div>
  </div>
</template>

<style scoped>
  * {
    --playhead-width: 0.8rem;
    --video-player-button-size: 2rem;
  }

  .video-player-container {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
    color: white;
    background-color: var(--tertiary-color);
  }

  .video-player-container video {
    width: 100%;
  }

  .video-controls {
    position: absolute;
    bottom: 0;
    z-index: 2;
    display: flex;
    gap: var(--gutter);
    align-items: center;
    width: calc(100% - var(--gutter) * 2);
    padding: var(--gutter);
    visibility: visible;
    background-color: rgb(34 34 37 / 80%);
    opacity: 1;
    transition: visibility 0.5s, opacity 0.5s;
  }

  .video-controls.hidden {
    visibility: hidden;
    opacity: 0;
  }

  .video-controls.fullscreen {
    position: relative;
  }

  .play-pause-button,
  .volume-button,
  .fullscreen-button,
  .pic-in-pic-button {
    padding: 0;
    cursor: pointer;
    background-color: transparent;
    border: none;
    outline: none;
  }

  .play-pause-button {
    width: var(--video-player-button-size);
    min-width: var(--video-player-button-size);
    height: var(--video-player-button-size);
  }

  .volume-button,
  .fullscreen-button,
  .pic-in-pic-button {
    width: calc(var(--video-player-button-size) * 0.65);
    min-width: calc(var(--video-player-button-size) * 0.65);
    height: calc(var(--video-player-button-size) * 0.65);
  }

  .play-pause-button img,
  .volume-button img,
  .fullscreen-button img,
  .pic-in-pic-button img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  .play-pause-button img.hidden,
  .volume-button img.hidden,
  .fullscreen-button img.hidden,
  .pic-in-pic-button img.hidden {
    display: none;
  }

  .timeline-container {
    position: relative;
    width: 100%;
    height: var(--playhead-width);
  }

  .playhead {
    position: absolute;
    top: 0;
    left: calc(var(--playhead-width) / 2);
    z-index: 3;
    width: var(--playhead-width);
    height: var(--playhead-width);
    background: var(--primary-color);
    border-radius: 50%;
  }

  .timeline-progress-container {
    position: absolute;
    top: 50%;
    display: grid;
    width: 100%;
    transform: translateY(-50%);
  }

  .timeline-background,
  .timeline-played {
    grid-area: 1 / 1;
    width: 100%;
    height: 0.15rem;
    background: white;
    border-radius: 50px;
  }

  .timeline-played {
    background: var(--primary-color);
  }

  .current-time-text,
  .duration-text {
    position: absolute;
    top: 100%;
    font-size: 0.8rem;
  }

  .current-time-text p,
  .duration-text p {
    margin: 0;
    font-size: 0.8rem;
  }

  .current-time-text {
    left: 0;
    color: var(--primary-color);
  }

  .duration-text {
    right: 0;
    color: white;
  }
</style>
