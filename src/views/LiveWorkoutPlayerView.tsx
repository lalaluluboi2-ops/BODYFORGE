import React, { useState, useEffect } from 'react';
import { Workout, CompletedWorkoutRecord } from '../types';
import { MotionDemoPlayer } from '../components/MotionDemoPlayer';
import { audioService } from '../services/audioService';
import { speechService } from '../services/speechService';
import { 
  Play, 
  Pause, 
  SkipForward, 
  RotateCcw, 
  X, 
  Volume2, 
  VolumeX, 
  CheckCircle2, 
  Award
} from 'lucide-react';

interface LiveWorkoutPlayerViewProps {
  workout: Workout;
  uid: string;
  onExit: () => void;
  onFinished: (record: CompletedWorkoutRecord) => void;
}

export const LiveWorkoutPlayerView: React.FC<LiveWorkoutPlayerViewProps> = ({
  workout,
  uid,
  onExit,
  onFinished
}) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isResting, setIsResting] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [workoutFinished, setWorkoutFinished] = useState(false);
  const [totalElapsedTime, setTotalElapsedTime] = useState(0);
  const [userRating, setUserRating] = useState(5);
  const [userNotes, setUserNotes] = useState('');

  const currentExercise = workout.exercises[currentIdx];
  const nextExercise = workout.exercises[currentIdx + 1];

  // Initialize exercise or rest interval
  useEffect(() => {
    if (!currentExercise) return;
    if (isResting) {
      setTimerSeconds(currentExercise.restSeconds || 25);
      audioService.playRestChime();
      speechService.speak(`Rest for ${currentExercise.restSeconds} seconds. Next up: ${nextExercise ? nextExercise.name : 'Finish'}`);
    } else {
      setTimerSeconds(currentExercise.durationSeconds || 0);
      audioService.playStartChime();
      speechService.speak(`Start: ${currentExercise.name}. ${currentExercise.durationSeconds ? currentExercise.durationSeconds + ' seconds' : currentExercise.reps + ' reps'}`);
    }
  }, [currentIdx, isResting]);

  // Main countdown loop
  useEffect(() => {
    if (!isActive || workoutFinished) return;

    const interval = setInterval(() => {
      setTotalElapsedTime((t) => t + 1);

      setTimerSeconds((prev) => {
        if (prev <= 1) {
          if (isResting) {
            setIsResting(false);
            if (currentIdx + 1 < workout.exercises.length) {
              setCurrentIdx((i) => i + 1);
            } else {
              completeWorkout();
            }
          } else {
            if (currentExercise.durationSeconds) {
              if (currentIdx + 1 < workout.exercises.length) {
                setIsResting(true);
              } else {
                completeWorkout();
              }
            }
          }
          return 0;
        }

        if (prev <= 4 && prev > 1) {
          audioService.playBeep(520, 0.08);
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, isResting, currentIdx, workoutFinished, currentExercise]);

  const toggleSound = () => {
    const nextState = !isMuted;
    setIsMuted(nextState);
    audioService.setMuted(nextState);
    speechService.setEnabled(!nextState);
  };

  const handleManualExerciseCompletion = () => {
    if (currentIdx + 1 < workout.exercises.length) {
      setIsResting(true);
    } else {
      completeWorkout();
    }
  };

  const completeWorkout = () => {
    setIsActive(false);
    setWorkoutFinished(true);
    audioService.playVictoryFanfare();
    speechService.speak("Congratulations! Workout complete.");
  };

  const handleSaveAndExit = () => {
    const record: CompletedWorkoutRecord = {
      id: `${workout.id}_${Date.now()}`,
      workoutId: workout.id,
      workoutTitle: workout.title,
      date: new Date().toISOString(),
      durationSeconds: Math.max(totalElapsedTime, 60),
      exercisesCompleted: workout.exercises.length,
      caloriesBurnedEstimate: Math.round((totalElapsedTime / 60) * 8.5),
      userRating,
      notes: userNotes.trim() || undefined
    };
    onFinished(record);
  };

  if (workoutFinished) {
    return (
      <div className="min-h-screen bg-charcoal-950 p-6 flex flex-col justify-between max-w-md mx-auto">
        <div className="pt-6 text-center">
          <div className="w-20 h-20 mx-auto rounded-full bg-forge-lime/10 border-2 border-forge-lime flex items-center justify-center mb-4">
            <Award className="w-10 h-10 text-forge-lime animate-bounce" />
          </div>
          <span className="text-xs uppercase tracking-widest text-forge-lime font-mono font-bold">SESSION COMPLETED</span>
          <h2 className="text-2xl font-black text-white mt-1">{workout.title}</h2>
          <p className="text-sm text-gray-400 mt-1">Calisthenic volume recorded to your profile.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3 my-6">
          <div className="bg-charcoal-900 border border-charcoal-800 rounded-xl p-3 text-center">
            <p className="text-[11px] text-gray-400">Total Time</p>
            <p className="text-lg font-bold text-white font-mono mt-0.5">
              {Math.floor(totalElapsedTime / 60)}m {totalElapsedTime % 60}s
            </p>
          </div>
          <div className="bg-charcoal-900 border border-charcoal-800 rounded-xl p-3 text-center">
            <p className="text-[11px] text-gray-400">Exercises</p>
            <p className="text-lg font-bold text-forge-lime font-mono mt-0.5">
              {workout.exercises.length} / {workout.exercises.length}
            </p>
          </div>
          <div className="bg-charcoal-900 border border-charcoal-800 rounded-xl p-3 text-center">
            <p className="text-[11px] text-gray-400">Est. Burn</p>
            <p className="text-lg font-bold text-forge-cyan font-mono mt-0.5">
              ~{Math.round((totalElapsedTime / 60) * 8.5)} kcal
            </p>
          </div>
        </div>

        {/* Workout Rating & Notes */}
        <div className="bg-charcoal-900 border border-charcoal-800 rounded-xl p-4 mb-6">
          <p className="text-xs font-semibold text-gray-300 mb-2">Rate Intensity</p>
          <div className="flex justify-between gap-1 mb-4">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setUserRating(star)}
                className={`flex-1 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                  userRating >= star 
                    ? 'bg-forge-lime text-black' 
                    : 'bg-charcoal-800 text-gray-400'
                }`}
              >
                {star}★
              </button>
            ))}
          </div>

          <label className="text-xs font-semibold text-gray-300 block mb-1">Session Notes (Optional)</label>
          <textarea
            value={userNotes}
            onChange={(e) => setUserNotes(e.target.value)}
            placeholder="Felt strong on push-ups, rested 5 extra seconds on plank..."
            className="w-full bg-charcoal-950 border border-charcoal-700 rounded-lg p-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-forge-lime"
            rows={2}
          />
        </div>

        {/* Persist Action Button */}
        <button
          onClick={handleSaveAndExit}
          className="w-full py-4 rounded-xl bg-forge-lime hover:bg-forge-lime-hover text-black font-extrabold uppercase tracking-wide flex items-center justify-center gap-2 shadow-forge-glow transition-all"
        >
          <CheckCircle2 className="w-5 h-5" /> Save Workout & Return
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-charcoal-950 flex flex-col justify-between p-4 md:p-6 max-w-lg mx-auto">
      {/* Top Bar Navigation */}
      <div className="flex items-center justify-between">
        <button 
          onClick={onExit}
          className="p-2 rounded-xl bg-charcoal-900 border border-charcoal-800 text-gray-400 hover:text-white"
          aria-label="Exit workout"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center">
          <span className="text-[11px] font-mono text-gray-400 uppercase tracking-wider">
            {isResting ? 'REST INTERVAL' : `EXERCISE ${currentIdx + 1} OF ${workout.exercises.length}`}
          </span>
          <h3 className="text-sm font-bold text-white line-clamp-1">{workout.title}</h3>
        </div>

        <button 
          onClick={toggleSound}
          className="p-2 rounded-xl bg-charcoal-900 border border-charcoal-800 text-gray-400 hover:text-white"
          aria-label="Toggle sound cues"
        >
          {isMuted ? <VolumeX className="w-5 h-5 text-red-400" /> : <Volume2 className="w-5 h-5 text-forge-lime" />}
        </button>
      </div>

      {/* Progress Strip */}
      <div className="w-full h-1.5 bg-charcoal-900 rounded-full mt-3 overflow-hidden flex">
        {workout.exercises.map((_, i) => (
          <div
            key={i}
            className={`h-full flex-1 mx-0.5 rounded-full transition-all ${
              i < currentIdx 
                ? 'bg-forge-lime' 
                : i === currentIdx 
                  ? 'bg-forge-cyan animate-pulse' 
                  : 'bg-charcoal-800'
            }`}
          />
        ))}
      </div>

      {/* Main Kinetic Demonstration or Rest Display */}
      <div className="my-4">
        {isResting ? (
          <div className="w-full h-56 md:h-72 rounded-2xl bg-charcoal-900 border border-charcoal-800 flex flex-col items-center justify-center p-6 text-center">
            <span className="text-xs uppercase tracking-widest text-forge-cyan font-mono font-bold">RECOVER & BREATHE</span>
            <div className="text-6xl font-black text-white font-mono my-3">{timerSeconds}s</div>
            {nextExercise && (
              <div className="text-xs text-gray-400 flex items-center gap-1.5 mt-2 bg-charcoal-850 px-3 py-1.5 rounded-lg border border-charcoal-700">
                <span>Next:</span>
                <strong className="text-forge-lime">{nextExercise.name}</strong>
              </div>
            )}
          </div>
        ) : (
          <MotionDemoPlayer exercise={currentExercise} showDetails={false} />
        )}
      </div>

      {/* Exercise Information Card */}
      <div className="bg-charcoal-900 border border-charcoal-800 rounded-2xl p-4">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-black text-white">{currentExercise.name}</h2>
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {currentExercise.targetMuscles.map(m => (
                <span key={m} className="px-2 py-0.5 rounded-md bg-charcoal-800 text-[10px] text-gray-300 font-medium">
                  {m}
                </span>
              ))}
            </div>
          </div>

          <div className="text-right">
            {currentExercise.durationSeconds ? (
              <div className="text-2xl font-black text-forge-lime font-mono">
                {timerSeconds}s
              </div>
            ) : (
              <div className="text-2xl font-black text-forge-lime font-mono">
                {currentExercise.reps} <span className="text-xs text-gray-400 font-sans font-normal">reps</span>
              </div>
            )}
          </div>
        </div>

        {/* Step-by-Step Form Instructions & Cues */}
        <div className="mt-4 pt-3 border-t border-charcoal-800 text-xs space-y-2">
          <p className="text-gray-300">
            <strong className="text-forge-lime">Form Cue:</strong> {currentExercise.formCues[0]}
          </p>
          <p className="text-gray-400">
            <strong className="text-red-400">Avoid:</strong> {currentExercise.mistakesToAvoid[0]}
          </p>
          <div className="bg-charcoal-950 p-2 rounded-lg text-gray-400 border border-charcoal-800">
            <strong className="text-forge-cyan">Beginner Scale:</strong> {currentExercise.beginnerModification}
          </div>
        </div>
      </div>

      {/* Interactive Controls Bar */}
      <div className="mt-4 pt-2 flex items-center gap-3">
        <button
          onClick={() => {
            if (currentExercise.durationSeconds) {
              setTimerSeconds(currentExercise.durationSeconds);
            }
          }}
          className="p-3.5 rounded-xl bg-charcoal-900 border border-charcoal-800 text-gray-400 hover:text-white"
          title="Restart Current Step"
        >
          <RotateCcw className="w-5 h-5" />
        </button>

        {currentExercise.durationSeconds ? (
          <button
            onClick={() => setIsActive(!isActive)}
            className="flex-1 py-3.5 rounded-xl bg-forge-lime hover:bg-forge-lime-hover text-black font-extrabold uppercase tracking-wider flex items-center justify-center gap-2 shadow-forge-glow transition-all"
          >
            {isActive ? <Pause className="w-5 h-5 fill-black" /> : <Play className="w-5 h-5 fill-black" />}
            {isActive ? 'Pause Timer' : 'Resume'}
          </button>
        ) : (
          <button
            onClick={handleManualExerciseCompletion}
            className="flex-1 py-3.5 rounded-xl bg-forge-lime hover:bg-forge-lime-hover text-black font-extrabold uppercase tracking-wider flex items-center justify-center gap-2 shadow-forge-glow transition-all"
          >
            <CheckCircle2 className="w-5 h-5" /> Complete Set
          </button>
        )}

        <button
          onClick={() => {
            if (currentIdx + 1 < workout.exercises.length) {
              setIsResting(false);
              setCurrentIdx((i) => i + 1);
            } else {
              completeWorkout();
            }
          }}
          className="p-3.5 rounded-xl bg-charcoal-900 border border-charcoal-800 text-gray-400 hover:text-white"
          title="Skip to Next"
        >
          <SkipForward className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
