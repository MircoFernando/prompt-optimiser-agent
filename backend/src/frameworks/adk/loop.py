import os
import time
from google.adk import Agent, Loop
from google.adk.runner import Runner
from google.adk.sessions import InMemorySession

def load_prompt(filename):
    path = os.path.join(os.path.dirname(__file__), "prompts", filename)
    with open(path, "r") as f:
        return f.read()

# Define Agents
generator_agent = Agent(name="Generator", model="gemini-2.5-flash", instruction=load_prompt("generator.txt"))
critic_agent = Agent(name="Critic", model="gemini-2.5-flash", instruction=load_prompt("critic.txt"))

# The Core Architecture Primitive
prompt_loop = Loop(
name="ReflectionLoop",
steps=[generator_agent, critic_agent],
condition=lambda session: "APPROVED" not in session.get_last_message().text.upper()
)

def execute_adk_optimization(user_input: str, max_iterations: int):
    start_time = time.time()
    session = InMemorySession()
    runner = Runner(agent=prompt_loop, session=session)

    # Enforce max loops via system prompt injection
    response = runner.run(f"Optimize this: {user_input}. (Stop after {max_iterations} iterations).")

    latency = round(time.time() - start_time, 2)
    messages = session.get_messages()

    # Extract the final prompt (ignoring the "APPROVED" message)
    final_draft = messages[-2].text if len(messages) > 1 and "APPROVED" in response.text.upper() else response.text

    return final_draft, latency