import pandas as pd
import heapq
import sys
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
in_path = os.path.join(BASE_DIR, "in")
STATIC_PATH = os.path.join(BASE_DIR, "..", "static")
cpp_data = pd.read_csv(os.path.join(STATIC_PATH, "awards_us_2026.csv"))

# in_path = 'in'
# cpp_data = pd.read_csv(f"{in_path}/awards_2026.csv")
# iata_icao_data = pd.read_csv(f"{in_path}/iata-icao.csv")
# per_diem_data = pd.read_csv(f"{in_path}/FY2026_PerDiemMasterRatesFile.csv")

# iata_icao_data = iata_icao_data[
#     (iata_icao_data['country_code'] == 'US')
# ]
# iata_icao_data.reset_index(drop = True, inplace = True)
# out_path = "out"
# iata_icao_data.to_csv(f"{out_path}/iata-icao-us.csv", index=False)

# cpp_data = cpp_data[
#     (cpp_data['ORIGIN_COUNTRY'] == 'UNITED STATES') &
#     (cpp_data['DESTINATION_COUNTRY'] == 'UNITED STATES')
# ]
# cpp_data.reset_index(drop = True, inplace = True)
# out_path = "out"
# cpp_data.to_csv(f"{out_path}/awards_us_2026.csv", index=False)

def heuristic(current_cost, weight):
    return current_cost + weight

# graph = {}
# for _, row in cpp_data.iterrows():
#     start = row['ORIGIN_AIRPORT_ABBREV']
#     goal = row['DESTINATION_AIRPORT_ABBREV']
#     weight = row['YCA_FARE']
    
#     if start not in graph:
#         graph[start] = []
#     if goal not in graph:
#         graph[goal] = []
    
#     # Assuming bidirectional flights
#     graph[start].append((goal, weight))
#     graph[goal].append((start, weight))

# A* Algorithm Implementation
# def a_star(graph, start, goal):
#     queue = []
#     heapq.heappush(queue, (0, start))
#     came_from = {start: None}
#     cost_so_far = {start: 0}
    
#     while queue:
#         current_priority, current_node = heapq.heappop(queue)
        
#         if current_node == goal:
#             break
        
#         for neighbor, weight in graph.get(current_node, []):
#             new_cost = heuristic(cost_so_far[current_node], weight)
#             if neighbor not in cost_so_far or new_cost < cost_so_far[neighbor]:
#                 cost_so_far[neighbor] = new_cost
#                 priority = new_cost  # No heuristic used here
#                 heapq.heappush(queue, (priority, neighbor))
#                 came_from[neighbor] = current_node
    
#     # Reconstruct path
#     path = []
#     node = goal
#     while node is not None:
#         path.append(node)
#         node = came_from.get(node)
#     path.reverse()
    
#     return path, cost_so_far.get(goal, float('inf'))

# # Example run: CDC to MID
# start = 'MSP'
# goal = 'DCA'
# path, total_cost = a_star(graph, start, goal)
# print(f"Path from {start} to {goal}: {path}")
# print(f"Total YCA Fare: ${total_cost}")

graph = {}
for _, row in cpp_data.iterrows():
    start = row['ORIGIN_AIRPORT_ABBREV']
    goal = row['DESTINATION_AIRPORT_ABBREV']
    weight = row['YCA_FARE']
    
    if start not in graph:
        graph[start] = []
    if goal not in graph:
        graph[goal] = []
    
    # Assuming bidirectional flights
    graph[start].append((goal, weight))
    graph[goal].append((start, weight))

# A* Algorithm Implementation
def a_star(graph, start, goal):
    queue = []
    heapq.heappush(queue, (0, start))
    came_from = {start: None}
    cost_so_far = {start: 0}
    
    while queue:
        current_priority, current_node = heapq.heappop(queue)
        
        if current_node == goal:
            break
        
        for neighbor, weight in graph.get(current_node, []):
            new_cost = heuristic(cost_so_far[current_node], weight)
            if neighbor not in cost_so_far or new_cost < cost_so_far[neighbor]:
                cost_so_far[neighbor] = new_cost
                priority = new_cost
                heapq.heappush(queue, (priority, neighbor))
                came_from[neighbor] = current_node
    
    # Reconstruct path
    path = []
    node = goal
    while node is not None:
        path.append(node)
        node = came_from.get(node)
    path.reverse()
    
    return path, cost_so_far.get(goal, float('inf'))

# Function to find the optimal meeting point for multiple travelers
def optimal_meeting_point(graph, start_points):
    min_total_cost = float('inf')
    best_meeting_point = None
    
    for airport in graph.keys():
        total_cost = 0
        for start in start_points:
            _, cost = a_star(graph, start, airport)
            total_cost += cost
        
        if total_cost < min_total_cost:
            min_total_cost = total_cost
            best_meeting_point = airport
    
    return best_meeting_point, min_total_cost

# Function to print the paths from multiple starting points to a target airport
def print_paths_to_destination(graph, start_points, destination):
    for start in start_points:
        path, cost = a_star(graph, start, destination)
        print(f"Path from {start} to {destination}: {path}")
        print(f"Total YCA Fare from {start} to {destination}: ${cost}")

# Example run with a list of starting points
if len(sys.argv) < 2:
    raise ValueError("Provide comma-separated airports, e.g. 'MSP,DCA,MIA'")
airport_str = sys.argv[1]
start_points = airport_str.split(",")
# start_points = ['MSP', 'DCA', 'MIA']
meeting_point, total_cost = optimal_meeting_point(graph, start_points)
# print(f"Optimal meeting point for {start_points}: {meeting_point}")
# print(f"Total YCA Fare: ${total_cost}")
# print_paths_to_destination(graph, start_points, meeting_point)

def main(start_points):
    meeting_point, total_cost = optimal_meeting_point(graph, start_points)
    return meeting_point, total_cost

if __name__ == "__main__":
    import sys, json

    if len(sys.argv) < 2:
        raise ValueError("Provide comma-separated airports, e.g. 'MSP,DCA,MIA'")

    airport_str = sys.argv[1]
    start_points = airport_str.split(",")

    meeting_point, total_cost = main(start_points)

    # Output ONLY the meeting-point airport
    print(meeting_point)