
import { getDatabase, ref, onValue, update, query, orderByChild } from "firebase/database"

export type TrainingModule = {
  id: number
  title: string
  description: string
  progress: number
  duration: string
  completed: boolean
}

export const fetchTrainingModules = async (userId: string): Promise<TrainingModule[]> => {
  return new Promise((resolve, reject) => {
    const db = getDatabase()
    const modulesRef = query(ref(db, `users/${userId}/trainingModules`), orderByChild('id'))

    onValue(modulesRef, (snapshot) => {
      if (!snapshot.exists()) {
        const defaultModules = [
          {
            id: 1,
            title: "CoS Fundamentals",
            description: "Learn the core principles of being an effective Chief of Staff",
            progress: 0,
            duration: "45 min",
            completed: false
          },
          {
            id: 2,
            title: "Strategic Planning",
            description: "Master the art of strategic planning and execution",
            progress: 0,
            duration: "1h 15min",
            completed: false
          },
          {
            id: 3,
            title: "Communication Skills",
            description: "Develop advanced communication and presentation skills",
            progress: 0,
            duration: "1h",
            completed: false
          },
          {
            id: 4,
            title: "Time Management",
            description: "Optimize your productivity and time allocation",
            progress: 0,
            duration: "50 min",
            completed: false
          }
        ]
        
        update(ref(db, `users/${userId}`), {
          trainingModules: defaultModules
        })
        resolve(defaultModules)
      } else {
        const modules: TrainingModule[] = []
        snapshot.forEach((childSnapshot) => {
          modules.push({
            id: childSnapshot.val().id,
            ...childSnapshot.val()
          })
        })
        resolve(modules)
      }
    }, (error) => {
      console.error("Error fetching training modules:", error)
      reject(error)
    })
  })
}

export const updateModuleProgress = async (
  userId: string,
  moduleId: number,
  newProgress: number,
  completed: boolean
) => {
  const db = getDatabase()
  return update(ref(db, `users/${userId}/trainingModules/${moduleId - 1}`), {
    progress: newProgress,
    completed
  })
}

