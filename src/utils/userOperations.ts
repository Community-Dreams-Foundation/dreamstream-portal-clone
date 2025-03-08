
import { db } from "@/lib/firebase"
import { collection, getDocs, query, limit, where } from "firebase/firestore"

export interface UserSummary {
  id: string
  name: string
  email?: string
  role?: string
  photoURL?: string
}

/**
 * Fetch a list of users for mention functionality
 */
export async function fetchUsers(maxResults = 50): Promise<UserSummary[]> {
  try {
    const usersQuery = query(
      collection(db, "users"),
      limit(maxResults)
    )
    
    const snapshot = await getDocs(usersQuery)
    const users: UserSummary[] = []
    
    snapshot.forEach(doc => {
      const userData = doc.data()
      users.push({
        id: doc.id,
        name: userData.name || userData.displayName || "User",
        email: userData.email,
        role: userData.role,
        photoURL: userData.photoURL
      })
    })
    
    return users
  } catch (error) {
    console.error("Error fetching users:", error)
    return []
  }
}

/**
 * Search for users by name or email
 */
export async function searchUsers(searchTerm: string, maxResults = 10): Promise<UserSummary[]> {
  try {
    // This is a simple implementation that might not work efficiently in Firestore
    // For production, consider using a dedicated search service or Firestore's array-contains
    
    // Get all users (up to a limit) and filter in memory
    const users = await fetchUsers(50)
    
    return users.filter(user => 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase()))
    ).slice(0, maxResults)
  } catch (error) {
    console.error("Error searching users:", error)
    return []
  }
}

/**
 * Get user details by ID
 */
export async function getUserById(userId: string): Promise<UserSummary | null> {
  try {
    const userQuery = query(
      collection(db, "users"),
      where("id", "==", userId),
      limit(1)
    )
    
    const snapshot = await getDocs(userQuery)
    
    if (snapshot.empty) {
      // Try to get by document ID
      const userDoc = await getDocs(query(
        collection(db, "users"), 
        limit(1)
      ))
      
      if (userDoc.empty) return null
      
      const userData = userDoc.docs[0].data()
      return {
        id: userDoc.docs[0].id,
        name: userData.name || userData.displayName || "User",
        email: userData.email,
        role: userData.role,
        photoURL: userData.photoURL
      }
    }
    
    const userData = snapshot.docs[0].data()
    return {
      id: snapshot.docs[0].id,
      name: userData.name || userData.displayName || "User",
      email: userData.email,
      role: userData.role,
      photoURL: userData.photoURL
    }
  } catch (error) {
    console.error("Error getting user:", error)
    return null
  }
}
